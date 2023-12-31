# Go-Spring

<img align="right" width="159px" src="/logo.svg"/>

`Go-Spring` vision is to empower Go programmers with a powerful programming framework similar to Java `Spring`. It is dedicated to providing users with a simple, secure, and reliable programming experience.

This project initial code based from [go-spring/go-spring](https://github.com/go-spring/go-spring) created by [lvan100](https://github.com/lvan100)

### Install
`go get github.com/go-spring-projects/go-spring@latest`

### IoC container

In addition to implementing a powerful IoC container similar to Java Spring, Go-Spring also extends the concept of beans. In Go, objects (pointers), arrays, maps, and function pointers can all be considered beans and can be placed in the IoC container.

| Java Spring 				                      | Go-Spring			                   |
|:--------------------------------------|:-------------------------------|
| `@Value` 								                     | `value:"${}"` 				             |
| `@Autowired` `@Qualifier` `@Required` | `autowire:"?"` 				            |
| `@Configurable` 						                | `WireBean()` 					             |
| `@Configuration`                      | `Configuration()`              |
| `@Profile` 							                    | `ConditionOnProfile()` 		      |
| `@Primary` 							                    | `Primary()` 					              |
| `@DependsOn` 							                  | `DependsOn()` 				             |
| `@ConstructorBinding` 				            | `RegisterBeanFn()` 			         |
| `@ComponentScan` `@Indexed` 			       | Package Import 				            |
| `@Conditional` 						                 | `NewConditional()` 			         |
| `@ConditionalOnExpression` 			        | `NewExpressionCondition()` 	   |
| `@ConditionalOnProperty` 				         | `NewPropertyValueCondition()`	 |
| `@ConditionalOnBean` 					            | `NewBeanCondition()` 			       |
| `@ConditionalOnMissingBean` 			       | `NewMissingBeanCondition()`	   |
| `@ConditionalOnClass` 				            | Don't Need 					               |
| `@ConditionalOnMissingClass` 			      | Don't Need 					               |
| `@Lookup` 							                     | —— 							                     |

### How to use

> Golang does not support annotations, bean registration needs to be written code. And due to the package trimming, you must import the package to ensure that the registration code is executed correctly.

#### Hello world

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
    m.Logger.Info("Hello world")
    return nil
}

func main() {
    // register object bean
    gs.Object(new(MyApp))
	
    // run go-spring boot app
    gs.Run()
}

// Output:
// time=2023-09-25T14:50:32.927+08:00 level=INFO source=main.go:14 msg="Hello world" logger=go-spring type=main.MyApp
```

#### Bean register

```go
package mypkg

type MyApp struct {}

type NewApp() *MyApp {
	return &MyApp{}
}

func init() {
	// register object bean
	gs.Object(&MyApp{})
	
	// or
	
	// register method bean: bean created from the registration method.
	gs.Provide(NewApp) 
}
```

#### Annotations syntax

Property binding and bean injection annotations are marked using struct field tags.

##### Property binding

Bind properties to a value, the bind value can be primitive type, map, slice, struct. When binding to struct, the tag 'value' indicates which properties should be bind. The 'value' tags are defined by value:"${a:=b}", 'a' is the property name, 'b' is the default value.

![binding](/image/binding.svg)

##### Dependency Injection

Dependency Injection is a design pattern used to implement decoupling between classes and the management of dependencies. It transfers the responsibility of creating and maintaining dependencies to an external container, so that the class does not need to instantiate dependent objects itself. Instead, the external container dynamically injects the dependencies.

![autowire](/image/autowire.svg)

### Conditional registering

According to the conditions specified at registration, you can control whether the Bean is effective.

```
func OnBean(selector BeanSelector) 
func OnExpression(expression string)
func OnMatches(fn func(ctx Context) (bool, error)) 
func OnMissingBean(selector BeanSelector) 
func OnMissingProperty(name string) 
func OnProfile(profile string)
func OnProperty(name string, options ...PropertyOption)
func OnSingleBean(selector BeanSelector) 
```

### Property source

`Go-Spring` not only supports property binding for primitive data types but also supports property binding for custom value types. It also provides support for nested binding of struct properties.

Built-in configuration data source support based on the local file system, and built up the support of the data format of `.yaml` `.properties` `.toml`.

The default we will try to load all the supported file formats from `./config/`, load according to the following priority levels:
1. Load `./config/application.{yaml|properties|toml}`.
2. Load `./config/application-{profiles}.{yaml|properties|toml}`.
3. Load environment variables starting with `GS_`.
4. Load command line args of `-D key=value`.

The earlier the configuration is loaded, the lower the priority, which means that it may be overwritten by subsequent configurations with higher priorities.


```go
type DBOptions struct {
	UserName string `value:"${username}"`
	Password string `value:"${password}"`
	IP       string `value:"${ip}"`
	Port     string `value:"${port}"`
	DB       string `value:"${db}"`
}

type DbConfig struct {
	DB []DBOptions `value:"${db}"`
}
```

The above code can be bound using the following configuration：

```yaml
db:
  -
    username: root
    password: 123456
    ip: 1.1.1.1
    port: 3306
    db: db1
  -
    username: root
    password: 123456
    ip: 1.1.1.1
    port: 3306
    db: db2
```

### Property validator

`Go-Spring` allows you to register a custom value validator. If the value verification fails, the `Go-Spring` will give an error in the startup stage.

In this example, we will use [go-validator/validator](https://github.com/go-validator/validator), you can refer to this example to register your custom validator.

```go
package main

import (
	"fmt"
	"log/slog"

	"github.com/go-spring-projects/go-spring/conf"
	"github.com/go-spring-projects/go-spring/gs"
	"gopkg.in/validator.v2"
)

const validatorTagName = "validate"

type validatorWrapper struct {
	validator *validator.Validator
}

func (v *validatorWrapper) Field(tag string, i interface{}) error {
	if 0 == len(tag) {
		return nil
	}
	return v.validator.Valid(i, tag)
}

func init() {
	conf.Register(validatorTagName, &validatorWrapper{validator: validator.NewValidator().WithTag(validatorTagName)})
}

//--------------------------------------------------------------------------

type DBOptions struct {
	UserName string `value:"${username}"`
	Password string `value:"${password}"`
	IP       string `value:"${ip}"`
	Port     int32  `value:"${port}" validate:"min=1024,max=65535"`
	DB       string `value:"${db}" validate:"nonzero"`
}

type MysqlDatabase struct {
	Logger  *slog.Logger `logger:""`
	Options DBOptions    `value:"${db}"`
}

func (md *MysqlDatabase) OnInit(ctx gs.Context) error {
	md.Logger.Info("mysql connection summary",
		"url", fmt.Sprintf("mysql://%s:%s@%s:%d/%s", md.Options.UserName, md.Options.Password, md.Options.IP, md.Options.Port, md.Options.DB))
	return nil
}

func main() {

	gs.Property("db.username", "admin")
	gs.Property("db.password", "123456")
	gs.Property("db.ip", "127.0.0.1")
	gs.Property("db.port", "0") // set db.port=0
	gs.Property("db.db", "test")

	gs.Object(new(MysqlDatabase))

	if err := gs.Run(); nil != err {
		panic(err)
	}
}

//
// Output:
// panic: container refresh failed
// ↳object bean "main/main.MysqlDatabase:MysqlDatabase" /projects/go-project/gocase/validator/main.go:58
// ↳bind MysqlDatabase.Options error: validate MysqlDatabase.Options.Port error: less than min
```

### Dynamic property

Allows dynamically refresh properties during runtime, not only supporting basic data types, but also structures, slices, and Map types.

```go
package main

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-spring-projects/go-spring/dync"
	"github.com/go-spring-projects/go-spring/gs"
)

type Handler struct {
	Open dync.Bool `value:"${server.open:=true}"`
}

func (h *Handler) OnInit(ctx gs.Context) error {

	http.HandleFunc("/server/status", func(writer http.ResponseWriter, request *http.Request) {
		if !h.Open.Value() {
			http.Error(writer, "server closed", http.StatusNotAcceptable)
			return
		}

		fmt.Fprint(writer, "server running")
	})
	return nil
}

type Server struct {
	Logger *slog.Logger `logger:""`
}

func (s *Server) OnInit(ctx gs.Context) error {

	props := ctx.(gs.Container).Properties()

	http.HandleFunc("/server/status/open", func(writer http.ResponseWriter, request *http.Request) {
		props.Set("server.open", "true")
		s.Logger.Info("server opened")
	})

	http.HandleFunc("/server/status/close", func(writer http.ResponseWriter, request *http.Request) {
		props.Set("server.open", "false")
		s.Logger.Info("server closed")
	})

	go func() {
		http.ListenAndServe(":7878", nil)
	}()

	return nil
}

func main() {

	gs.Object(new(Handler))
	gs.Object(new(Server))

	if err := gs.Run(); nil != err {
		panic(err)
	}
}


// Output:
// 
// $ curl http://127.0.0.1:7878/server/status
// server running
//
// $ curl http://127.0.0.1:7878/server/status/close
//
// $ curl http://127.0.0.1:7878/server/status
// server closed
//
// $ curl http://127.0.0.1:7878/server/status/open
//
// $ curl http://127.0.0.1:7878/server/status
// server running
```

### Structured logger

Automatically injects named logger, the logger library powered by the std [slog](https://pkg.go.dev/log/slog).

```go
package main

import (
	"io"
	"log/slog"
	"os"
	"strings"

	"github.com/go-spring-projects/go-spring/gs"
)

func init() {
	type Logger struct {
		Level   string `value:"${level:=debug}"`
		File    string `value:"${file:=}"`
		Console bool   `value:"${console:=false}"`
		Primary bool   `value:"${primary:=false}"`
	}

    /*
        logger:
          # application logger.
          app:
            level: debug
            file: /your/path/app.log
            console: false
            primary: true
    
          # system logger.
          sys:
            level: info
            file: /your/path/sys.log
            console: true
    
          # trace logger.
          trace:
            level: info
            file: /your/path/trace.log
            console: false
    */

	gs.OnProperty("logger", func(loggers map[string]Logger) {
		for name, logger := range loggers {
			var logWriter = io.Discard

			// write log to file
			if len(logger.File) > 0 {
				file, err := os.OpenFile(logger.File, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
				if nil != err {
					panic(err)
				}
				logWriter = file
			}

			// combine to console
			if logger.Console {
				if logWriter != io.Discard {
					logWriter = io.MultiWriter(os.Stdout, logWriter)
				} else {
					logWriter = os.Stdout
				}
			}

			// update logger output level
			var lever slog.LevelVar
			switch strings.ToLower(logger.Level) {
			case "info":
				lever.Set(slog.LevelInfo)
			case "warn":
				lever.Set(slog.LevelWarn)
			case "error":
				lever.Set(slog.LevelError)
			default:
				lever.Set(slog.LevelDebug)
			}

			// register logger to go-spring
			gs.SetLogger(name, slog.New(slog.NewJSONHandler(logWriter, &slog.HandlerOptions{Level: &lever})), logger.Primary)
		}
	})
}

type App struct {
	Logger      *slog.Logger `logger:""`
	SysLogger   *slog.Logger `logger:"sys"`
	TraceLogger *slog.Logger `logger:"${app.trace.logger:=trace}"`
}

func (app *App) OnInit(ctx gs.Context) error {
	app.Logger.Info("hello primary logger")
	app.SysLogger.Info("hello system logger")
	app.TraceLogger.Info("hello trace logger")
	return nil
}

func main() {
	
	gs.Property("logger.app.level", "debug")
	gs.Property("logger.app.file", "./app.log")
	gs.Property("logger.app.console", "true")
	gs.Property("logger.app.primary", "true")

	gs.Property("logger.sys.level", "debug")
	gs.Property("logger.sys.file", "./sys.log")
	gs.Property("logger.sys.console", "true")

	gs.Property("logger.trace.level", "info")
	gs.Property("logger.trace.file", "./trace.log")
	gs.Property("logger.trace.console", "true")

	gs.Object(new(App))

	if err := gs.Run(); nil != err {
		panic(err)
	}
}

// Output: 
// {"time":"2023-10-27T12:10:14.8040121+08:00","level":"INFO","msg":"hello primary logger","logger":"app","type":"main.App"}
// {"time":"2023-10-27T12:10:14.8040121+08:00","level":"INFO","msg":"hello system logger","logger":"sys","type":"main.App"}
// {"time":"2023-10-27T12:10:14.8040121+08:00","level":"INFO","msg":"hello trace logger","logger":"trace","type":"main.App"}
```

### Dependent order event

Initialization and deinitialization based on dependency order, everything will be executed as expected.

![order](/image/event.svg)

### Project layout

This is the recommended basic layout for a `Go-Spring` application project, As your project grows keep in mind that it'll be important to make sure your code is well structured otherwise you'll end up with a messy code with lots of hidden dependencies and global state.

> If you are trying to learn Go or if you are building a simple project for yourself this project layout is an overkill.

```
|-- cmd                             # main applications for this project.
|   |-- bizapp                      # your business app.
|       ` main.go                   # main entrypoint.
|-- config                          # the root directory of the configuration file.
|   |-- application.yaml            # default configs.
|   `-- application-dev.yaml        # business configs.
|-- pkg                             # allowed use by external applications.
|   |-- internal                    # private library code of pkg.
|   |-- api                         # protocol definition files (e.g, .proto).
|   |-- common                      # commom code pacakge.
|   |-- infra                       # infrastructure code pacakge.
|   |-- services                    # the root directory of the service implementation.
|       |-- a-service               # implement service a.
|       |-- b-service               # implement service b.
|       `-- c-service               # implement service c.
|-- docs                            # design and user documents.
|-- tools                           # supporting tools for this project (e.g, protoc).
|-- scripts                         # scripts to perform various build, install, analysis, etc operations.
`-- Makefile                        # Makefile.
```

This is a recommended code of `main.go`.

```go
package main

import (
	"os"
	"strings"

	"github.com/go-spring-projects/go-spring/gs"
	"github.com/urfave/cli/v2"
)

//import _ "testapp/pkg/infra"

//import _ "testapp/pkg/services/a-service"
//import _ "testapp/pkg/services/b-service"
//import _ "testapp/pkg/services/c-service"

func main() {

	cliApp := new(cli.App)
	cliApp.Name = "your-app-name"
	cliApp.Usage = "summary of your app"
	cliApp.Version = "v1.0.0"

	cliApp.Flags = []cli.Flag{
		&cli.StringFlag{
			Name:    "profile",
			Usage:   "launch app with application-${profile}.yaml",
			EnvVars: []string{"SPRING_PROFILE"},
		},
		&cli.StringSliceFlag{
			Name:    "config",
			Usage:   "config directory",
			EnvVars: []string{"SPRING_CONFIG"},
			Value:   cli.NewStringSlice("config"),
		},
		&cli.StringSliceFlag{
			Name:    "property",
			Aliases: []string{"D"},
			Usage:   "set a spring property value",
		},
	}

	cliApp.Action = func(context *cli.Context) error {
		gs.Setenv("GS_SPRING_CONFIG_LOCATIONS", strings.Join(context.StringSlice("config"), ","))
		gs.Setenv("GS_SPRING_CONFIG_PROFILES", context.String("profile"))
		return gs.Run()
	}

	if err := cliApp.Run(os.Args); nil != err {
		panic(err)
	}
}

```

### License

The `Go-Spring` is released under version 2.0 of the Apache License.
