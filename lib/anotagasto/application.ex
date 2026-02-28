defmodule Anotagasto.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      AnotagastoWeb.Telemetry,
      Anotagasto.Repo,
      {DNSCluster, query: Application.get_env(:anotagasto, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Anotagasto.PubSub},
      # Start a worker by calling: Anotagasto.Worker.start_link(arg)
      # {Anotagasto.Worker, arg},
      # Start to serve requests, typically the last entry
      AnotagastoWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    unless Anotagasto.Auth.Guardian.secret_available?() do
      raise "APP_SECRET environment variable is missing or empty"
    end

    opts = [strategy: :one_for_one, name: Anotagasto.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    AnotagastoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
