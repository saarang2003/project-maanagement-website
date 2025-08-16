from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mongo_uri : str
    mongo_db : str
    secret_key : str
    algorithm : str
    access_token_expire_minutes : int
    VITE_BACKEND_APP_API_URL: str

    model_config = SettingsConfigDict(env_file="server/.env")


settings = Settings()
    