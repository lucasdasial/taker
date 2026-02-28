defmodule AnotagastoWeb.Plugs.SetCurrentUser do
  require Logger
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    user = Guardian.Plug.current_resource(conn)
    Logger.info(%{event: "login", user: user.id})
    assign(conn, :user, user)
  end
end
