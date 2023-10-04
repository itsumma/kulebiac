## Структура StackConfig для SberCloud

| Параметр                                                 | Описание                                                                                   |
|----------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `accessKey <string, required>`                           | AccessKey для взаимодействия с API (создается вручную)                                     |
| `secretKey <string, required>`                           | SecretKey для взаимодействия с API (создается вручную)                                     |
| `projectId <string, required>`                           | Идентификатор проекта в облаке                                                             |
| `backendConfiguration <BackendConfiguration, required>`  | Параметры подключения к бакету для хранения стейта. [Структура...](#backend_configuration) |
| `iamUsers <IamUser[], optional>`                         | Массив для создания IAM-пользователей [Структура...](#iam_users)                           |
| `registries <Registry[], optional>`                      | Массив для создания Container-Registry [Структура...](#registry)                           |
| `buckets <Bucket[], optional>`                           | Массив для создания S3-бакеотов [Структура...](#buckets)                                   |
> Значение каждого параметра можно получить из переменных окружения с помошью конструкции `<%= env.ENV_NAME %>`

<a name="backend_configuration"></a>
### Backend Configuration

Конфигурация для бекенда стейта
<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                       | Описание                                        |
|--------------------------------|-------------------------------------------------|
| `bucket <string, required>`    | имя бакета (создается вручную)                  |
| `accessKey <string, required>` | аксесс кей для доступа в S3 (создается вручную) |
| `secretKey <string, required>` | секрет кей для доступа в S3 (создается вручную) |
</details>


<a name="iam_users"></a>
### IamUsers Module

IamUser - Создание IAM-пользователей, ролей, ключей доступа

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                              | Описание                                                                           |
|---------------------------------------|------------------------------------------------------------------------------------|
| `name <string, required>`             | имя пользователя                                                                   |
| `roles <string[], optional>`          | массив ролей для пользователя в display-name формате (например, SWR Administrator) |
| `createAccessKey <boolean, optional>` | флаг для создания ключей доступа                                                   |
</details>

<a name="registry"></a>
### Registry Module

Registry - создание container-registry

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                             | Описание                                                            |
|--------------------------------------|---------------------------------------------------------------------|
| `name <string, required>`            | имя registry                                                        |
| `images <RegistryImage[], optional>` | массив для создания Images                                          |
| `users <RegistryUser[], optional>`   | массив для предоставление доступов к registry для IAM-пользователей |


#### RegistryImage 
| Параметр                                        | Описание                                            |
|-------------------------------------------------|-----------------------------------------------------|
| `name <string, required>`                       | имя образа                                          |
| `isPublic <boolean, optional, default = false>` | флаг для предоставления публичного доступа к образу |
| `category <string, optional, default = other>`  | имя категории образа                                |

#### RegistryUser
| Параметр                                  | Описание                     |
|-------------------------------------------|------------------------------|
| `name <string, required>`                 | имя IAM-пользователя         |
| `role <string, optional, default = Read>` | роль пользователя в registry |

</details>

<a name="buckets"></a>
### Buckets Module

Bucket - конфигурация S3-бакета

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                              | Описание                                        |
|-------------------------------------------------------|-------------------------------------------------|
| `name <string, required>`                             | имя бакета                                      |
| `acl <string, optional, default = private>`           | acl бакета                                      |
| `storageClass <string, optional, default = STANDARD>` | storage class бакета                            |
| `versioning <boolean, optional, default = false>`     | флаг для включения версионирования бакета       |
| `cors <BucketCors, optional>`                         | конфигурация CORS для бакета                    |
| `website <BucketWebSite, optional>`                   | конфигурация web-site static hosting для бакета |


#### BucketCors
| Параметр                              | Описание                                  |
|---------------------------------------|-------------------------------------------|
| `enabled <boolean, required>`         | флаг для включения CORS-правил для бакета |
| `params <BucketCorsParams, required>` | правила конфигурации CORS                 |

#### BucketCorsParams
| Параметр                                               | Описание       |
|--------------------------------------------------------|----------------|
| `allowedHeaders <string[], optional, default = [*]>`   | allowedHeaders |
| `allowedMethods <string[], optional, default = [GET]>` | allowedMethods |
| `allowedOrigins <string[], optional, default = [*]>`   | allowedOrigins |
| `exposeHeaders <string[], optional>`                   | exposeHeaders  |
| `maxAgeSeconds <number, optional>`                     | maxAgeSeconds  |

#### BucketWebSite
| Параметр                              | Описание                                              |
|---------------------------------------|-------------------------------------------------------|
| `enabled <boolean, required>`         | флаг для включения web-site static hosting для бакета |
| `params <BucketCorsParams, required>` | правила конфигурации web-site static hosting          |

#### BucketWebSiteParams
| Параметр                                         | Описание                    |
|--------------------------------------------------|-----------------------------|
| `index <string, optional, default = index.html>` | файл для индексной страницы |
| `error <string, optional, default = error.html>` | файл для обработки ошибок   |


</details>