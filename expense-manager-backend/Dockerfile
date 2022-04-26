FROM golang

WORKDIR /app

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY *.go ./

RUN go build -o /expense-manager

EXPOSE 3030

CMD ["/expense-manager"]
