from flask import Flask, render_template

app = Flask(__name__)

AMINO_ACIDS = [
    {"name": "Alanine", "tr": "Alanin", "three": "Ala", "one": "A", "codons": ["GCU","GCC","GCA","GCG"], "group": "Apolar", "essential": False},
    {"name": "Arginine", "tr": "Arjinin", "three": "Arg", "one": "R", "codons": ["CGU","CGC","CGA","CGG","AGA","AGG"], "group": "Bazik", "essential": False},
    {"name": "Asparagine", "tr": "Asparajin", "three": "Asn", "one": "N", "codons": ["AAU","AAC"], "group": "Polar", "essential": False},
    {"name": "Aspartate", "tr": "Aspartik asit", "three": "Asp", "one": "D", "codons": ["GAU","GAC"], "group": "Asidik", "essential": False},
    {"name": "Cysteine", "tr": "Sistein", "three": "Cys", "one": "C", "codons": ["UGU","UGC"], "group": "Polar", "essential": False},
    {"name": "Glutamate", "tr": "Glutamik asit", "three": "Glu", "one": "E", "codons": ["GAA","GAG"], "group": "Asidik", "essential": False},
    {"name": "Glutamine", "tr": "Glutamin", "three": "Gln", "one": "Q", "codons": ["CAA","CAG"], "group": "Polar", "essential": False},
    {"name": "Glycine", "tr": "Glisin", "three": "Gly", "one": "G", "codons": ["GGU","GGC","GGA","GGG"], "group": "Özel", "essential": False},
    {"name": "Histidine", "tr": "Histidin", "three": "His", "one": "H", "codons": ["CAU","CAC"], "group": "Bazik", "essential": True},
    {"name": "Isoleucine", "tr": "İzolösin", "three": "Ile", "one": "I", "codons": ["AUU","AUC","AUA"], "group": "Apolar", "essential": True},
    {"name": "Leucine", "tr": "Lösin", "three": "Leu", "one": "L", "codons": ["UUA","UUG","CUU","CUC","CUA","CUG"], "group": "Apolar", "essential": True},
    {"name": "Lysine", "tr": "Lizin", "three": "Lys", "one": "K", "codons": ["AAA","AAG"], "group": "Bazik", "essential": True},
    {"name": "Methionine", "tr": "Metiyonin", "three": "Met", "one": "M", "codons": ["AUG"], "group": "Apolar", "essential": True},
    {"name": "Phenylalanine", "tr": "Fenilalanin", "three": "Phe", "one": "F", "codons": ["UUU","UUC"], "group": "Apolar", "essential": True},
    {"name": "Proline", "tr": "Prolin", "three": "Pro", "one": "P", "codons": ["CCU","CCC","CCA","CCG"], "group": "Özel", "essential": False},
    {"name": "Serine", "tr": "Serin", "three": "Ser", "one": "S", "codons": ["UCU","UCC","UCA","UCG","AGU","AGC"], "group": "Polar", "essential": False},
    {"name": "Threonine", "tr": "Treonin", "three": "Thr", "one": "T", "codons": ["ACU","ACC","ACA","ACG"], "group": "Polar", "essential": True},
    {"name": "Tryptophan", "tr": "Triptofan", "three": "Trp", "one": "W", "codons": ["UGG"], "group": "Apolar", "essential": True},
    {"name": "Tyrosine", "tr": "Tirozin", "three": "Tyr", "one": "Y", "codons": ["UAU","UAC"], "group": "Polar", "essential": False},
    {"name": "Valine", "tr": "Valin", "three": "Val", "one": "V", "codons": ["GUU","GUC","GUA","GUG"], "group": "Apolar", "essential": True},
]


@app.route("/")
def home():
    return render_template("home.html", active="home")


@app.route("/anlatim")
def lesson():
    return render_template("lesson.html", active="lesson")


@app.route("/oyun")
def games():
    return render_template("games.html", active="games")


@app.route("/amino-asitler")
def amino_acids():
    return render_template("amino_acids.html", active="amino", aas=AMINO_ACIDS)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
