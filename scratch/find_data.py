import pymongo
import os
from dotenv import load_dotenv
from pathlib import Path

# Load URI from .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))
uri = os.getenv('MONGODB_URI')

client = pymongo.MongoClient(uri)
print("Scanning cluster...")

found = False
for db_name in client.list_database_names():
    if db_name in ['admin', 'local', 'config']: continue
    db = client[db_name]
    for coll_name in db.list_collection_names():
        # Check for Yara Eslim or gaelle bitar
        doc = db[coll_name].find_one({"name": {"$in": ["Yara Eslim", "gaelle bitar"]}})
        if doc:
            print(f"✅ FOUND DATA IN!")
            print(f"   Database:   {db_name}")
            print(f"   Collection: {coll_name}")
            print(f"   Sample ID:  {doc.get('id')}")
            found = True

if not found:
    print("❌ Could not find 'Yara Eslim' or 'gaelle bitar' in any database.")
