
## 📝 Структура файла `config.yaml`

`stacks: []` - массив структур вида StackConfig

`StackConfig` - описание конфига конкретного стэка/окружения

**Параметры:**

| Параметр            | Описание                                               |
|---------------------|--------------------------------------------------------|
| `name <string>`     | имя стека/окружения (например - `stage \| production`) |
| `provider <string>` | имя провайдера (`yandex\|sber`)                        |

> Описание параметров StackConfig для [YandexCloud](https://github.com/itsumma/kulebiac/blob/master/USAGE-YANDEX.md)
> 
> Описание параметров StackConfig для [SberCloud](https://github.com/itsumma/kulebiac/blob/master/USAGE-SBERCLOUD.md)

