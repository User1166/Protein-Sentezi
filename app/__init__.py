from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    """Flask uygulaması fabrikası"""
    app = Flask(__name__, 
                template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
                static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    
    # Konfigürasyon
    app.config.from_object('config.Config')
    
    # Veritabanı başlatma
    db.init_app(app)
    
    with app.app_context():
        from app.models import User, Quiz, UserProgress
        db.create_all()
    
    # Blueprint'leri kaydetme
    from app.routes import main_bp, api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app
