import os

class Config:
    """Flask uygulaması için temel konfigürasyon"""
    SQLALCHEMY_DATABASE_URI = 'sqlite:///protein_app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'dev-secret-key-change-in-production'
    JSON_AS_ASCII = False
    JSON_SORT_KEYS = False
