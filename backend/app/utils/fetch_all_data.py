import requests


def fetch_all_data(api_url='https://api.bluelytics.com.ar/v2/evolution.json') -> dict:
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()
