import requests
from logger import logger


def fetch_latest_blue(api_url="https://dolarapi.com/v1/dolares/blue") -> dict:
    logger.info("Fetching latest blue")
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return {
            "type": "Blue",
            "source": "dolarapi",
            "updated_date": data["fechaActualizacion"],
            "buy": data["compra"],
            "sell": data["venta"],
        }
    else:
        response.raise_for_status()


def fetch_latest_crypto(api_url="https://dolarapi.com/v1/dolares/cripto") -> dict:
    logger.info("Fetching latest crypto")
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return {
            "type": "Crypto",
            "source": "dolarapi",
            "updated_date": data["fechaActualizacion"],
            "buy": data["compra"],
            "sell": data["venta"],
        }
    else:
        response.raise_for_status()
