"""
Protein Sentezi Eğitim Platformu - Ana Uygulama
Lise biyoloji dersinde protein sentezini interaktif olarak öğretmek için tasarlanmış Flask uygulaması
"""

import os
from app import create_app, db
from app.models import Quiz

# Flask uygulamasını oluştur
app = create_app()

# Veritabanı başlatma
with app.app_context():
    # Veritabanını oluştur
    db.create_all()
    
    # İlk quiz soruları varsa ekle
    if Quiz.query.count() == 0:
        print("Quiz soruları ekleniyor...")
        
        quizzes = [
            # DNA Soruları
            Quiz(
                question="DNA'nın tam adı nedir?",
                topic="DNA",
                difficulty=1,
                correct_answer="Deoksiribonükleik asit",
                options='["Deoksiribonükleik asit", "Ribonükleik asit", "Amino asit", "Protein"]',
                explanation="DNA (Deoksiribonükleik asit) tüm canlıların genetik bilgisini taşıyan moleküldür.",
                points=10
            ),
            Quiz(
                question="DNA'nın yapısında kaç çeşit nükleobaz vardır?",
                topic="DNA",
                difficulty=1,
                correct_answer="Dört",
                options='["İki", "Üç", "Dört", "Beş"]',
                explanation="DNA'da Adenin (A), Timin (T), Guanin (G) ve Sitosin (C) olmak üzere 4 çeşit nükleobaz vardır.",
                points=10
            ),
            Quiz(
                question="DNA'nın baz eşleştirme kuralında A'nın karşılığı nedir?",
                topic="DNA",
                difficulty=1,
                correct_answer="T",
                options='["G", "C", "T", "U"]',
                explanation="DNA'da Adenin (A) her zaman Timin (T) ile, Guanin (G) her zaman Sitosin (C) ile eşleşir.",
                points=10
            ),
            
            # RNA/Transkripsiyoni Soruları
            Quiz(
                question="Transkripsiyoni işlemi neyi kodlayan genetik bilgiyi mRNA'ya dönüştürür?",
                topic="RNA",
                difficulty=2,
                correct_answer="DNA",
                options='["DNA", "RNA", "Protein", "Ribozom"]',
                explanation="Transkripsiyoni, DNA'nın genetik bilgisinin mRNA kopyasına dönüştürülmesi işlemidir.",
                points=15
            ),
            Quiz(
                question="mRNA'da DNA'daki Timin (T) yerine hangi baz gelir?",
                topic="RNA",
                difficulty=2,
                correct_answer="Urasel (U)",
                options='["Adenin (A)", "Guanin (G)", "Sitosin (C)", "Urasel (U)"]',
                explanation="mRNA'da T yerine U (Urasel) kullanılır. Bu, DNA ve RNA arasındaki temel farktır.",
                points=15
            ),
            Quiz(
                question="Transkripsiyonu kataliz eden enzim hangisidir?",
                topic="RNA",
                difficulty=2,
                correct_answer="RNA Polimeraz",
                options='["DNA Polimeraz", "RNA Polimeraz", "Protease", "Ligase"]',
                explanation="RNA Polimeraz, DNA şeridini takip ederek mRNA'yı sentezleyen enzimdir.",
                points=15
            ),
            
            # mRNA ve Kodonlar Soruları
            Quiz(
                question="Kodon kaç nükleotidden oluşur?",
                topic="mRNA",
                difficulty=2,
                correct_answer="Üç",
                options='["Bir", "İki", "Üç", "Dört"]',
                explanation="Kodon, mRNA üzerindeki 3 nükleotid dizisidir ve bir amino asiti kodlar.",
                points=15
            ),
            Quiz(
                question="Protein sentezini başlatan kodon hangisidir?",
                topic="mRNA",
                difficulty=2,
                correct_answer="AUG",
                options='["UAA", "UAG", "AUG", "UGA"]',
                explanation="AUG kodononu başlangıç kodonu olarak görev yapır ve Metiyonin amino asidini kodlar.",
                points=15
            ),
            Quiz(
                question="Aşağıdakilerden hangisi durma (stop) kodonudur?",
                topic="mRNA",
                difficulty=2,
                correct_answer="UAA",
                options='["AUG", "CUU", "UAA", "GCU"]',
                explanation="UAA, UAG ve UGA translasyonu sonlandırıcı kodonlardır (stop kodonlar).",
                points=15
            ),
            
            # Translasyon Soruları
            Quiz(
                question="Translasyon işlemi nerede gerçekleşir?",
                topic="Translation",
                difficulty=3,
                correct_answer="Ribozomda",
                options='["Çekirdekte", "Ribozomda", "Mitokondride", "Endoplazmatik retikulum"]',
                explanation="Translasyon, mRNA'nın ribozomda okunması ve protein sentezinin gerçekleştiği işlemdir.",
                points=20
            ),
            Quiz(
                question="tRNA'nın görevi nedir?",
                topic="Translation",
                difficulty=3,
                correct_answer="Amino asitleri ribozoma taşımak",
                options='["mRNA yı taşımak", "Ribozomi taşımak", "Amino asitleri ribozoma taşımak", "Proteini sentezlemek"]',
                explanation="tRNA (transfer RNA), genetik kodda belirtilen amino asitleri ribozoma taşıyan adaptör moleküldür.",
                points=20
            ),
            Quiz(
                question="tRNA'nın antikodon bölgesi hangi bölgeyle eşleşir?",
                topic="Translation",
                difficulty=3,
                correct_answer="mRNA'nın kodon bölgesi",
                options='["DNA nın promotör bölgesi", "mRNA nın kodon bölgesi", "Ribozomun katalitik bölgesi", "Proteinin C-ucu"]',
                explanation="tRNA'nın antikodon bölgesi, mRNA'daki kodon bölgesiyle eşleşer ve tanıma sağlar.",
                points=20
            ),
            
            # Protein Yapısı Soruları
            Quiz(
                question="Proteinlerin yapı taşları olan moleküller nedir?",
                topic="Protein",
                difficulty=2,
                correct_answer="Amino asitler",
                options='["Nükleotidler", "Amino asitler", "Glikozlar", "Yağ asitleri"]',
                explanation="Proteinler amino asit zincirlerinden oluşur. Her amino asit peptit bağıyla birbirine bağlanır.",
                points=15
            ),
            Quiz(
                question="Kaç çeşit amino asit vardır?",
                topic="Protein",
                difficulty=2,
                correct_answer="20",
                options='["10", "15", "20", "25"]',
                explanation="Doğada bulunan proteinleri oluşturan 20 çeşit amino asit vardır.",
                points=15
            ),
            Quiz(
                question="Proteinlerin amino asitleri birbirlerine hangi bağla bağlanır?",
                topic="Protein",
                difficulty=2,
                correct_answer="Peptit bağı",
                options='["Hidrojen bağı", "Peptit bağı", "Fosfoester bağı", "Glikosidik bağ"]',
                explanation="Peptit bağı, amino asitlerin -COOH grubu ile diğer amino asitin -NH2 grubu arasında oluşan bağdır.",
                points=15
            ),
        ]
        
        for quiz in quizzes:
            db.session.add(quiz)
        
        db.session.commit()
        print(f"[OK] {len(quizzes)} quiz sorusu basariyla eklendi!")
    else:
        print(f"[OK] Veritabaninda zaten {Quiz.query.count()} quiz sorusu var!")

def fix_quiz_correct_answers():
    from app.models import Quiz
    from app import db
    quizzes = Quiz.query.all()
    for quiz in quizzes:
        cleaned = quiz.correct_answer.strip().capitalize()
        if quiz.correct_answer != cleaned:
            quiz.correct_answer = cleaned
    db.session.commit()
    print(f"{len(quizzes)} quiz cevabı güncellendi.")

if __name__ == '__main__':
    fix_quiz_correct_answers()
    # Flask geliştirme sunucusunu başlat
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
