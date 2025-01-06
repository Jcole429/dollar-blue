import time
import schedule
import sys
from fetch_data import fetch_latest_blue_bluelytics, fetch_latest_blue_dolarapi, fetch_latest_crypto
from db_utils import check_and_insert_data


def fetch_and_store():
    try:
        # Fetch data from both APIs
        data_1 = fetch_latest_blue_dolarapi()
        data_2 = fetch_latest_blue_bluelytics()
        data_3 = fetch_latest_crypto()

        # Store in the database
        check_and_insert_data(data_1["type"], data_1["source"], data_1["updated_date"], data_1["buy"], data_1["sell"])
        check_and_insert_data(data_2["type"], data_2["source"], data_2["updated_date"], data_2["buy"], data_2["sell"])
        check_and_insert_data(data_3["type"], data_3["source"], data_3["updated_date"], data_3["buy"], data_3["sell"])

    except Exception as e:
        print(f"Error during fetch and store: {e}", file=sys.stderr)


# Schedule the job to run every 5 minutes
schedule.every(5).minutes.do(fetch_and_store)

if __name__ == "__main__":
    # logger.info("Starting the scheduler...")
    # while True:
    #     schedule.run_pending()
    #     time.sleep(1)
    fetch_and_store()
