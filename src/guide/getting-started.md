# Getting Started

## Install
`go get go-spring.dev/spring@latest`

## Hello world

```go
package main

import (
	"context"
	"log/slog"

	"go-spring.dev/spring/gs"
)

type MyApp struct {
	Logger *slog.Logger `logger:""`
}

func (m *MyApp) OnInit(ctx context.Context) error {
	m.Logger.Info("Hello world")
	return nil
}

func main() {
	// register object bean
	gs.Object(new(MyApp))

	// run go-spring boot app
	gs.Run()
}

```