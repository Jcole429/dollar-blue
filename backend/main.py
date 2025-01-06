import time
import schedule
from fetch_data import fetch_latest_blue, fetch_latest_crypto
from db_utils import check_and_insert_data
from logger import logger


def fetch_and_store():
    try:
        # Fetch data from both APIs
        data_1 = fetch_latest_blue()
        data_2 = fetch_latest_crypto()

        # Store in the database
        check_and_insert_data(data_1["type"], data_1["source"], data_1["updated_date"], data_1["buy"], data_1["sell"])
        check_and_insert_data(data_2["type"], data_2["source"], data_2["updated_date"], data_2["buy"], data_2["sell"])

    except Exception as e:
        logger.error(f"Error during fetch and store: {e}")


# Schedule the job to run every 5 minutes
schedule.every(5).minutes.do(fetch_and_store)

if __name__ == "__main__":
    logger.info("Starting the scheduler...")
    while True:
        schedule.run_pending()
        time.sleep(1)
