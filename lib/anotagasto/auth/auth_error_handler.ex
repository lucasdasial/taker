defmodule Anotagasto.Auth.AuthErrorHandler do
  import Plug.Conn
  use Gettext, backend: AnotagastoWeb.Gettext

  @behaviour Guardian.Plug.ErrorHandler

  @impl Guardian.Plug.ErrorHandler

  def auth_error(conn, {_type, _reason}, _opts) do
    conn
    |> put_status(:unauthorized)
    |> Phoenix.Controller.json(%{error: dgettext("errors", "Unauthorized")})
  end
end
