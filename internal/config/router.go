package config

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/lucasdasial/anota-gasto/internal/auth"
	"github.com/lucasdasial/anota-gasto/internal/expenses"
)

func NewRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Route("/api", func(r chi.Router) {
		r.Use(middleware.Logger)

		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(200)
			w.Write([]byte("Hello World!"))
		})

		// Públicas
		r.Mount("/auth", auth.BuildRouter())

		// Autenticadas
		r.Group(func(r chi.Router) {
			// r.Use(middleware.BasicAuth())
			r.Mount("/expenses", expenses.BuildRouter())
		})

	})

	return router
}
