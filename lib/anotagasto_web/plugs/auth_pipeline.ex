defmodule AnotagastoWeb.Plugs.AuthPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :anotagasto,
    module: Anotagasto.Auth.Guardian,
    error_handler: Anotagasto.Auth.AuthErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
  plug AnotagastoWeb.Plugs.SetCurrentUser
end
