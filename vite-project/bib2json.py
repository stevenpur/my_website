import bibtexparser
import json

# Open the .bib file and parse its contents using the bibtexparser library
with open('./publications.bib') as bib_file:
    bib_database = bibtexparser.load(bib_file)

# Convert the parsed .bib file to a list of dictionaries
bib_dict = bib_database.entries

# Write the list of dictionaries to a JSON file
with open('publications.json', 'w') as json_file:
    json.dump(bib_dict, json_file, indent=4)