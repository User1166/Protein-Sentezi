from app import db
from datetime import datetime

class User(db.Model):
    """Kullanıcı modeli"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    total_score = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    
    # İlişkiler
    progress = db.relationship('UserProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    quiz_answers = db.relationship('QuizAnswer', backref='user', lazy=True, cascade='all, delete-orphan')
    game_scores = db.relationship('GameScore', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'total_score': self.total_score,
            'level': self.level,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None
        }

class Quiz(db.Model):
    """Quiz soruları modeli"""
    __tablename__ = 'quizzes'
    
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500), nullable=False)
    topic = db.Column(db.String(100), nullable=False)  # DNA, RNA, Amino Acid, Protein vb.
    difficulty = db.Column(db.Integer, default=1)  # 1-3: Kolay, Orta, Zor
    correct_answer = db.Column(db.String(200), nullable=False)
    options = db.Column(db.String(500), nullable=False)  # JSON formatında tutulacak
    explanation = db.Column(db.Text)
    points = db.Column(db.Integer, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # İlişkiler
    answers = db.relationship('QuizAnswer', backref='quiz', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Quiz {self.topic}>'
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'question': self.question,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'options': json.loads(self.options),
            'explanation': self.explanation,
            'points': self.points
        }

class QuizAnswer(db.Model):
    """Quiz cevapları (Kullanıcı yanıtları)"""
    __tablename__ = 'quiz_answers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    user_answer = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    points_earned = db.Column(db.Integer, default=0)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<QuizAnswer user_id={self.user_id} quiz_id={self.quiz_id}>'

class UserProgress(db.Model):
    """Kullanıcı öğrenme ilerlemesi"""
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic = db.Column(db.String(100), nullable=False)  # DNA, RNA, Protein vb.
    quiz_count = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserProgress user_id={self.user_id} topic={self.topic}>'

class GameScore(db.Model):
    """Oyun skorları"""
    __tablename__ = 'game_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_name = db.Column(db.String(100), nullable=False)  # TranscriptionGame, TranslationGame, FoldingGame
    score = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    time_played = db.Column(db.Integer, default=0)  # saniye cinsinden
    completed = db.Column(db.Boolean, default=False)
    played_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<GameScore {self.game_name} score={self.score}>'
