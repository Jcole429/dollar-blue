import requests


def fetch_latest_blue_dolarapi(api_url="https://dolarapi.com/v1/dolares/blue") -> dict:
    print("Fetching latest blue from dolarapi")
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return {
            "type": "Blue",
            "source": "dolarapi",
            "updated_date": data["fechaActualizacion"],
            "buy": float(data["compra"]),
            "sell": float(data["venta"]),
        }
    else:
        response.raise_for_status()


def fetch_latest_blue_bluelytics(api_url="https://api.bluelytics.com.ar/v2/latest") -> dict:
    print("Fetching latest blue from bluelytics")
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return {
            "type": "Blue",
            "source": "bluelytics",
            "updated_date": data["last_update"],
            "buy": float(data["blue"]["value_buy"]),
            "sell": float(data["blue"]["value_sell"]),
        }
    else:
        response.raise_for_status()


def fetch_latest_crypto(api_url="https://dolarapi.com/v1/dolares/cripto") -> dict:
    print("Fetching latest crypto from dolarapi")
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return {
            "type": "Crypto",
            "source": "dolarapi",
            "updated_date": data["fechaActualizacion"],
            "buy": float(data["compra"]),
            "sell": float(data["venta"]),
        }
    else:
        response.raise_for_status()
