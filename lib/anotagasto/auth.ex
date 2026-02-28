defmodule Anotagasto.Auth do
  alias Anotagasto.Accounts
  alias Anotagasto.Auth.Guardian
  alias Anotagasto.Auth.Login

  def login(%Login{} = login) do
    with {:ok, user} <- Accounts.Repo.find_by_phone_number(login.phone_number),
         {:ok, _} <- verify_credential(login.password, user.password),
         {:ok, token, _claims} <- Guardian.encode_and_sign(user) do
      {:ok, token}
    end
  end

  defp verify_credential(login_password, hash_password) do
    if Bcrypt.verify_pass(login_password, hash_password) do
      {:ok, :valid}
    else
      {:error, :invalid_credentials}
    end
  end
end
