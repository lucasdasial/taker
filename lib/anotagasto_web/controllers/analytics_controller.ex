defmodule AnotagastoWeb.AnalyticsController do
  use AnotagastoWeb, :controller

  alias Anotagasto.Expenses.Analytics

  action_fallback AnotagastoWeb.FallbackController

  def daily(conn, params) do
    user = conn.assigns.user

    with {:ok, daily} <- Analytics.daily(user.id, params) do
      render(conn, :daily, daily)
    end
  end

  def summary(conn, params) do
    user = conn.assigns.user

    with {:ok, summary} <- Analytics.summary(user.id, params) do
      render(conn, :summary, summary)
    end
  end
end
