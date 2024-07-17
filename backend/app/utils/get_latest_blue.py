from utils.fetch_latest_data import fetch_latest_data


def get_latest_blue():
    _json = fetch_latest_data()
    last_price = _json['blue']['value_avg']
    last_update = _json['last_update']

    print(f'Fetched fetch_latest_blue: [value_avg:{last_price}, last_update: {last_update}]')

    return last_price, last_update
