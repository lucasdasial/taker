defmodule AnotagastoWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  require Logger
  use AnotagastoWeb, :controller
  use Gettext, backend: AnotagastoWeb.Gettext

  # This clause handles errors returned by Ecto's insert/update/delete.
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: AnotagastoWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  # This clause is an example of how to handle resources that cannot be found.
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(html: AnotagastoWeb.ErrorHTML, json: AnotagastoWeb.ErrorJSON)
    |> render(:"404")
  end

  def call(conn, {:error, :user_not_found}) do
    conn
    |> put_status(:not_found)
    |> json(%{error: dgettext("errors", "User not found")})
  end

  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: dgettext("errors", "Invalid credentials")})
  end

  def call(conn, params) do
    conn
    |> put_status(:bad_request)
    |> json(params)
  end
end
