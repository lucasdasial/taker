defmodule AnotagastoWeb.AnalyticsControllerTest do
  use AnotagastoWeb.ConnCase

  import Anotagasto.AccountsFixtures
  import Anotagasto.ExpensesFixtures

  alias Anotagasto.Auth.Guardian

  setup %{conn: conn} do
    user = user_fixture()
    {:ok, token, _claims} = Guardian.encode_and_sign(user)

    conn =
      conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("authorization", "Bearer #{token}")

    {:ok, conn: conn, user: user}
  end

  describe "daily" do
    test "returns empty days when no expenses for the month", %{conn: conn} do
      conn = get(conn, ~p"/api/analytics/daily?month=2000-01")
      data = json_response(conn, 200)["data"]

      assert data["month"] == "2000-01"
      assert data["days"] == []
    end

    test "returns one entry per day with expenses", %{conn: conn, user: user} do
      expense_fixture(%{user_id: user.id, value: 50})
      expense_fixture(%{user_id: user.id, value: 30})

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      conn = get(conn, ~p"/api/analytics/daily?month=#{current_month}")
      data = json_response(conn, 200)["data"]

      assert length(data["days"]) == 1
      [day] = data["days"]
      assert day["count"] == 2
    end

    test "days are sorted by date ascending", %{conn: conn, user: user} do
      expense_fixture(%{user_id: user.id})

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      conn = get(conn, ~p"/api/analytics/daily?month=#{current_month}")
      dates = json_response(conn, 200)["data"]["days"] |> Enum.map(& &1["date"])

      assert dates == Enum.sort(dates)
    end

    test "defaults to current month when month param is absent", %{conn: conn, user: user} do
      expense_fixture(%{user_id: user.id})

      conn = get(conn, ~p"/api/analytics/daily")
      data = json_response(conn, 200)["data"]

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      assert data["month"] == current_month
      assert length(data["days"]) == 1
    end

    test "does not return expenses from other users", %{conn: conn} do
      other_user = user_fixture(%{phone_number: "other_phone"})
      expense_fixture(%{user_id: other_user.id})

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      conn = get(conn, ~p"/api/analytics/daily?month=#{current_month}")

      assert json_response(conn, 200)["data"]["days"] == []
    end

    test "returns 422 for invalid month format", %{conn: conn} do
      conn = get(conn, ~p"/api/analytics/daily?month=invalid")
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "summary" do
    test "returns empty summary when no expenses for the month", %{conn: conn} do
      conn = get(conn, ~p"/api/analytics/summary?month=2000-01")
      data = json_response(conn, 200)["data"]

      assert data["month"] == "2000-01"
      assert data["count"] == 0
      assert data["by_category"] == []
    end

    test "returns summary with aggregated expenses for the month", %{conn: conn, user: user} do
      expense_fixture(%{user_id: user.id, category: :food, value: 100})
      expense_fixture(%{user_id: user.id, category: :food, value: 50})
      expense_fixture(%{user_id: user.id, category: :transport, value: 30})

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      conn = get(conn, ~p"/api/analytics/summary?month=#{current_month}")
      data = json_response(conn, 200)["data"]

      assert data["count"] == 3
      assert length(data["by_category"]) == 2

      food = Enum.find(data["by_category"], &(&1["category"] == "food"))
      assert food["count"] == 2
    end

    test "by_category is sorted by total descending", %{conn: conn, user: user} do
      expense_fixture(%{user_id: user.id, category: :transport, value: 10})
      expense_fixture(%{user_id: user.id, category: :food, value: 200})

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      conn = get(conn, ~p"/api/analytics/summary?month=#{current_month}")
      [first | _] = json_response(conn, 200)["data"]["by_category"]

      assert first["category"] == "food"
    end

    test "defaults to current month when month param is absent", %{conn: conn, user: user} do
      expense_fixture(%{user_id: user.id})

      conn = get(conn, ~p"/api/analytics/summary")
      data = json_response(conn, 200)["data"]

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      assert data["month"] == current_month
      assert data["count"] == 1
    end

    test "does not return expenses from other users", %{conn: conn} do
      other_user = user_fixture(%{phone_number: "other_phone"})
      expense_fixture(%{user_id: other_user.id})

      current_month = Calendar.strftime(DateTime.utc_now(), "%Y-%m")
      conn = get(conn, ~p"/api/analytics/summary?month=#{current_month}")
      data = json_response(conn, 200)["data"]

      assert data["count"] == 0
    end

    test "returns 422 for invalid month format", %{conn: conn} do
      conn = get(conn, ~p"/api/analytics/summary?month=invalid")
      assert json_response(conn, 422)["errors"] != %{}
    end

    test "returns 422 for invalid month date", %{conn: conn} do
      conn = get(conn, ~p"/api/analytics/summary?month=2026-13")
      assert json_response(conn, 422)["errors"] != %{}
    end
  end
end
