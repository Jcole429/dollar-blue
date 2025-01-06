from fetch_data import fetch_latest_blue, fetch_latest_crypto
from db_utils import check_and_insert_data
from logger import logger


def handler(request):
    try:
        data_1 = fetch_latest_blue()
        data_2 = fetch_latest_crypto()

        # Store in the database
        check_and_insert_data(data_1["type"], data_1["source"], data_1["updated_date"], data_1["buy"], data_1["sell"])
        check_and_insert_data(data_2["type"], data_2["source"], data_2["updated_date"], data_2["buy"], data_2["sell"])

        return {"statusCode": 200, "body": "Data fetched and stored successfully."}
    except Exception as e:
        logger.error(f"Error during fetch and store: {e}")
        return {"statusCode": 500, "body": "Internal Server Error"}
