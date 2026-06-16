#!/bin/sh
set -e

# 获取挂载卷的实际 UID 和 GID
DATA_DIR="${DATA_DIR:-/app/data}"

# 如果数据目录不存在，创建它
if [ ! -d "$DATA_DIR" ]; then
    mkdir -p "$DATA_DIR"
fi

# 获取数据目录的所有者 UID 和 GID
ACTUAL_UID=$(stat -c '%u' "$DATA_DIR" 2>/dev/null || stat -f '%u' "$DATA_DIR" 2>/dev/null || echo "0")
ACTUAL_GID=$(stat -c '%g' "$DATA_DIR" 2>/dev/null || stat -f '%g' "$DATA_DIR" 2>/dev/null || echo "0")

echo "Data directory: $DATA_DIR"
echo "Directory owner UID:GID = $ACTUAL_UID:$ACTUAL_GID"

# 如果是 root (UID 0)，创建或使用匹配的用户
if [ "$ACTUAL_UID" = "0" ]; then
    echo "Running as root user"
    exec dumb-init -- "$@"
else
    # 创建与挂载卷权限匹配的用户和组
    if ! getent group "$ACTUAL_GID" > /dev/null 2>&1; then
        addgroup -g "$ACTUAL_GID" appgroup
    fi

    if ! getent passwd "$ACTUAL_UID" > /dev/null 2>&1; then
        adduser -D -u "$ACTUAL_UID" -G "$(getent group "$ACTUAL_GID" | cut -d: -f1)" appuser
    fi

    # 确保应用目录的权限正确
    chown -R "$ACTUAL_UID:$ACTUAL_GID" /app

    echo "Running as UID:GID = $ACTUAL_UID:$ACTUAL_GID"

    # 使用 su-exec 切换到对应用户执行命令
    exec su-exec "$ACTUAL_UID:$ACTUAL_GID" dumb-init -- "$@"
fi
