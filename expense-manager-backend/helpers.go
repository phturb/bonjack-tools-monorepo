package main

import (
    "strconv"
    "github.com/gin-gonic/gin"
)

func parseParamId(paramName string, c *gin.Context) (id uint, err error) {
    uint64Id, err := strconv.ParseUint(c.Param(paramName), 10, 0)
    if err != nil {
        return
    }
    id = uint(uint64Id)
    return
}
