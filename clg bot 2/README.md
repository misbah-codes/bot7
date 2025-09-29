# College Enquiry Chatbot

An AI-powered chatbot for Nawab Shah Alam Khan College of Engineering and Technology, Hyderabad. This chatbot helps students and visitors get information about the college, courses, admissions, facilities, and more.

## Features

- **Natural Language Processing**: Understands and responds to user queries in natural language
- **Responsive Design**: Works on both desktop and mobile devices
- **Quick Suggestions**: Provides quick question suggestions for common queries
- **Real-time Interaction**: Instant responses to user queries
- **Modern UI**: Clean and intuitive user interface

## Prerequisites

- Python 3.8 or higher
- MySQL Server
- Node.js and npm (for frontend dependencies, if any)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd clg-chatbot
```

### 2. Create and Activate Virtual Environment

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

1. Copy the `.env.example` file to `.env`
2. Update the database credentials in the `.env` file

```bash
cp .env.example .env
```

### 5. Set Up MySQL Database

1. Make sure MySQL server is running
2. Create a new database named `college_chatbot`
3. Update the database credentials in the `.env` file if needed

### 6. Initialize the Database

Run the following command to create the necessary tables:

```bash
python init_db.py
```

### 7. Run the Application

```bash
flask run
```

Open your browser and navigate to `http://localhost:5000` to access the chatbot.

## Project Structure

```
.
├── app.py                # Main Flask application
├── requirements.txt      # Python dependencies
├── .env                 # Environment variables
├── .gitignore
├── README.md
├── static/              # Static files (CSS, JS, images)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
│       └── college-logo.png
├── templates/           # HTML templates
│   └── index.html
└── intents.json         # Chatbot training data
```

## Customizing the Chatbot

### Adding New Intents

To add new intents or modify existing ones, edit the `intents.json` file. Each intent should have:

- `tag`: A unique identifier for the intent
- `patterns`: List of possible user inputs that trigger this intent
- `responses`: List of possible responses for this intent

Example:
```json
{
    "tag": "greeting",
    "patterns": ["Hi", "Hello", "Hey"],
    "responses": ["Hello! How can I help you today?", "Hi there!"]
}
```

### Styling

You can customize the look and feel of the chatbot by modifying the CSS in `static/css/style.css`.

## Technologies Used

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: MySQL
- **NLP**: NLTK, scikit-learn

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/)
- [NLTK](https://www.nltk.org/)
- [scikit-learn](https://scikit-learn.org/)
- [Font Awesome](https://fontawesome.com/)
