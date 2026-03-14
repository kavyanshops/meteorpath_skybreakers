import sys

from loguru import logger

logger.remove()

logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG",
    colorize=True,
)

logger.add(
    "logs/meteorpath.log",
    rotation="10 MB",
    retention="7 days",
    compression="gz",
    serialize=True,
    level="INFO",
)
