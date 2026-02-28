defmodule AnotagastoWeb.AuthController do
  alias Anotagasto.Auth
  alias Anotagasto.Auth.Login
  use AnotagastoWeb, :controller

  action_fallback AnotagastoWeb.FallbackController

  def login(conn, params) do
    with {:ok, login} <- Login.valid?(params),
         {:ok, token} <- Auth.login(login) do
      conn
      |> put_status(:ok)
      |> json(%{token: token})
    end
  end
end
