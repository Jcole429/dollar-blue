from utils.fetch_all_data import fetch_all_data


def filter_json(data, filter_func) -> dict:
    filtered_records = [record for record in data if filter_func(record)]
    return {"records": filtered_records}


def is_blue_record(record) -> bool:
    return record["source"] == 'Blue'


def json_to_tuples(data, keys):
    records = data['records']
    tuples_list = None
    tuples_list = [tuple(record[key] for key in keys) for record in records]
    return tuples_list


def get_all_blue() -> dict:
    json_data = fetch_all_data()

    json_data = filter_json(json_data, is_blue_record)

    # Specify the keys to include in the tuples
    keys = ['date', 'value_sell', 'value_buy']

    # Convert JSON to list of tuples
    tuples_list = json_to_tuples(json_data, keys)

    return tuples_list
