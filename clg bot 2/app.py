from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
import os
from dotenv import load_dotenv
import json
import nltk
from nltk.stem import WordNetLemmatizer
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random

# Download required NLTK data
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')

# Load environment variables
load_dotenv()

app = Flask(__name__)

# MySQL Configuration
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'college_chatbot')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

# Initialize MySQL
mysql = MySQL(app)

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Load intents
with open('intents.json', 'r', encoding='utf-8') as file:
    intents = json.load(file)

# Preprocess data
documents = []
classes = []
ignore_letters = ['?', '!', '.', ',']

for intent in intents['intents']:
    for pattern in intent['patterns']:
        # Tokenize each word in the pattern
        word_list = nltk.word_tokenize(pattern)
        documents.append((word_list, intent['tag']))
        # Add to classes if not already present
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Lemmatize and clean words
words = [lemmatizer.lemmatize(word.lower()) for word_list, _ in documents for word in word_list if word not in ignore_letters]
words = sorted(list(set(words)))

# Create training data
training = []
output_empty = [0] * len(classes)

for doc in documents:
    bag = []
    word_patterns = doc[0]
    word_patterns = [lemmatizer.lemmatize(word.lower()) for word in word_patterns]
    
    for word in words:
        bag.append(1) if word in word_patterns else bag.append(0)
    
    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1
    training.append([bag, output_row])

# Shuffle the training data
random.shuffle(training)

# Create vectorizer
tfidf_vectorizer = TfidfVectorizer()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    user_message = request.json['message']
    
    # Preprocess user message
    words = nltk.word_tokenize(user_message)
    words = [lemmatizer.lemmatize(word.lower()) for word in words if word not in ignore_letters]
    
    # Calculate TF-IDF scores
    message_tfidf = tfidf_vectorizer.fit_transform([' '.join(words)])
    
    # Compare with patterns
    max_similarity = -1
    response = "I'm sorry, I didn't understand that. Could you please rephrase?"
    
    for intent in intents['intents']:
        for pattern in intent['patterns']:
            pattern_tfidf = tfidf_vectorizer.transform([pattern])
            similarity = cosine_similarity(message_tfidf, pattern_tfidf)[0][0]
            
            if similarity > max_similarity:
                max_similarity = similarity
                if max_similarity > 0.5:  # Threshold for matching
                    response = random.choice(intent['responses'])
    
    return jsonify({'response': response})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
