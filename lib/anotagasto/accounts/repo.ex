defmodule Anotagasto.Accounts.Repo do
  alias Anotagasto.Accounts.User
  alias Anotagasto.Repo

  def find_by_phone_number(number) do
    case Repo.get_by(User, phone_number: number) do
      %User{} = user -> {:ok, user}
      _ -> {:ok, :not_found}
    end
  end
end
