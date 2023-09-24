# Getting Started

## Install
`go get github.com/go-spring-projects/go-spring@latest`

## Hello world

```go
package main

import (
	"log/slog"

	"github.com/go-spring-projects/go-spring/gs"
)

type MyApp struct {
	Logger *slog.Logger `logger:""`
}

func (m *MyApp) OnInit(ctx gs.Context) error {
	m.Logger.Info("HELLO WORLD")
	return nil
}

func main() {
	// register object bean `MyApp`
	gs.Object(new(MyApp))

	// start go-spring boot app.
	gs.Run()
}

```