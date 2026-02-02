import models
from database import engine
import seed_db

def reset_and_seed():
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    print("Recreating tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Seeding database...")
    seed_db.seed_database()
    print("Done!")

if __name__ == "__main__":
    reset_and_seed()
