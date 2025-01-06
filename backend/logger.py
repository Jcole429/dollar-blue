import logging


def setup_logger():
    logger = logging.getLogger("dollar-blue")
    logger.setLevel(logging.INFO)

    # File handler
    file_handler = logging.FileHandler("app.log")
    file_handler.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    return logger


logger = setup_logger()
