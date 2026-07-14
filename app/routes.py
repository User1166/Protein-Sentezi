from flask import Blueprint, render_template, request, jsonify, session
from app import db
from app.models import User, Quiz, QuizAnswer, UserProgress, GameScore
import json
import secrets

# Blueprint'ler
main_bp = Blueprint('main', __name__)
api_bp = Blueprint('api', __name__)

# ==================== Ana Rotalar ====================

@main_bp.route('/')
def home():
    """Ana sayfa"""
    return render_template('home.html')

@main_bp.route('/learn')
def learn():
    """Öğrenme modülleri sayfası"""
    return render_template('learn.html')

@main_bp.route('/games')
def games():
    """Oyunlar sayfası"""
    return render_template('games.html')

@main_bp.route('/game/<game_type>')
def play_game(game_type):
    """Oyun sayfaları"""
    valid_games = ['transcription', 'translation', 'folding', 'protein_builder']
    if game_type not in valid_games:
        return "Oyun bulunamadı", 404
    return render_template(f'game_{game_type}.html')

@main_bp.route('/quiz')
def quiz():
    """Quiz sayfası"""
    return render_template('quiz.html')

@main_bp.route('/leaderboard')
def leaderboard():
    """Liderlik tablosu"""
    return render_template('leaderboard.html')

@main_bp.route('/about')
def about():
    """Hakkında sayfası"""
    return render_template('about.html')

@main_bp.route('/admin')
def admin():
    """Admin paneli"""
    return render_template('admin.html')

# ==================== API Endpoints ====================

@api_bp.route('/user/init', methods=['POST'])
def init_user():
    """Yeni kullanıcı başlatma veya mevcut oturumu al"""
    if 'user_id' not in session:
        # Yeni kullanıcı oluştur
        username = f"oyuncu_{secrets.token_hex(4)}"
        email = f"{username}@local.game"
        
        user = User(username=username, email=email)
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        session.permanent = True
    
    user = User.query.get(session['user_id'])
    return jsonify({
        'success': True,
        'user': user.to_dict()
    })

@api_bp.route('/quizzes', methods=['GET'])
def get_quizzes():
    """Tüm quiz soruları"""
    topic = request.args.get('topic', None)
    difficulty = request.args.get('difficulty', None)
    
    query = Quiz.query
    
    if topic:
        query = query.filter_by(topic=topic)
    if difficulty:
        query = query.filter_by(difficulty=int(difficulty))
    
    quizzes = query.all()
    return jsonify({
        'success': True,
        'quizzes': [q.to_dict() for q in quizzes]
    })

@api_bp.route('/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    """Belirli bir quiz sorusu"""
    quiz = Quiz.query.get_or_404(quiz_id)
    return jsonify({
        'success': True,
        'quiz': quiz.to_dict()
    })

@api_bp.route('/quiz/submit', methods=['POST'])
def submit_quiz_answer():
    """Quiz cevabı gönder"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Oturum açmış değilsiniz'}), 401
    
    data = request.get_json()
    quiz_id = data.get('quiz_id')
    user_answer = data.get('answer')
    
    quiz = Quiz.query.get_or_404(quiz_id)
    user = User.query.get(session['user_id'])
    
    # Cevabı kontrol et
    is_correct = user_answer.lower().strip() == quiz.correct_answer.lower().strip()
    points_earned = quiz.points if is_correct else 0
    
    # Cevabı kaydet
    quiz_answer = QuizAnswer(
        user_id=user.id,
        quiz_id=quiz_id,
        user_answer=user_answer,
        is_correct=is_correct,
        points_earned=points_earned
    )
    db.session.add(quiz_answer)
    
    # Kullanıcı puanını güncelle
    user.total_score += points_earned
    
    # Kullanıcı seviyesini güncelle (her 100 puan 1 seviye artar)
    user.level = (user.total_score // 100) + 1
    
    # İlerleme güncelle
    progress = UserProgress.query.filter_by(
        user_id=user.id,
        topic=quiz.topic
    ).first()
    
    if not progress:
        progress = UserProgress(
            user_id=user.id,
            topic=quiz.topic,
            quiz_count=1,
            correct_count=1 if is_correct else 0,
            accuracy=100.0 if is_correct else 0.0
        )
        db.session.add(progress)
    else:
        progress.quiz_count += 1
        if is_correct:
            progress.correct_count += 1
        progress.accuracy = (progress.correct_count / progress.quiz_count) * 100
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'correct': is_correct,
        'points_earned': points_earned,
        'explanation': quiz.explanation,
        'total_score': user.total_score
    })

@api_bp.route('/game/score', methods=['POST'])
def save_game_score():
    """Oyun puanı kaydet"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Oturum açmış değilsiniz'}), 401
    
    data = request.get_json()
    game_name = data.get('game_name')
    score = data.get('score')
    level = data.get('level', 1)
    time_played = data.get('time_played', 0)
    
    user = User.query.get(session['user_id'])
    
    # Oyun skorunu kaydet
    game_score = GameScore(
        user_id=user.id,
        game_name=game_name,
        score=score,
        level=level,
        time_played=time_played,
        completed=True
    )
    db.session.add(game_score)
    
    # Toplam puanı güncelle
    user.total_score += score
    
    # Kullanıcı seviyesini güncelle (her 100 puan 1 seviye artar)
    user.level = (user.total_score // 100) + 1
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'total_score': user.total_score,
        'message': f'Skor kaydedildi! +{score} puan kazandın!'
    })

@api_bp.route('/user/progress', methods=['GET'])
def get_user_progress():
    """Kullanıcı öğrenme ilerlemesi"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Oturum açmış değilsiniz'}), 401
    
    user = User.query.get(session['user_id'])
    progress = UserProgress.query.filter_by(user_id=user.id).all()
    
    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'progress': [
            {
                'topic': p.topic,
                'quiz_count': p.quiz_count,
                'correct_count': p.correct_count,
                'accuracy': round(p.accuracy, 2)
            }
            for p in progress
        ]
    })

@api_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Liderlik tablosu (en yüksek puan)"""
    limit = request.args.get('limit', 10, type=int)
    
    users = User.query.order_by(User.total_score.desc()).limit(limit).all()
    
    return jsonify({
        'success': True,
        'leaderboard': [
            {
                'rank': idx + 1,
                'username': user.username,
                'score': user.total_score,
                'level': user.level
            }
            for idx, user in enumerate(users)
        ]
    })

@api_bp.route('/stats', methods=['GET'])
def get_stats():
    """Genel istatistikler"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Oturum açmış değilsiniz'}), 401
    
    user = User.query.get(session['user_id'])
    
    # Oyun skorları
    game_scores = GameScore.query.filter_by(user_id=user.id).all()
    game_stats = {}
    for gs in game_scores:
        if gs.game_name not in game_stats:
            game_stats[gs.game_name] = {'total_score': 0, 'games_played': 0}
        game_stats[gs.game_name]['total_score'] += gs.score
        game_stats[gs.game_name]['games_played'] += 1
    
    # Quiz istatistikleri
    quiz_answers = QuizAnswer.query.filter_by(user_id=user.id).all()
    total_quizzes = len(quiz_answers)
    correct_quizzes = sum(1 for qa in quiz_answers if qa.is_correct)
    
    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'quiz_stats': {
            'total_answered': total_quizzes,
            'correct': correct_quizzes,
            'accuracy': round((correct_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0, 2)
        },
        'game_stats': game_stats
    })
