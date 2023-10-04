## Структура StackConfig для YandexCloud


| Параметр                                                   | Описание                                                                                                                       |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `cloudId <string, required>`                               | идентификатор облака                                                                                                           |
| `folderId <string, required>`                              | идетнификтор фолдера                                                                                                           |
| `token <string, required>`                                 | API-токен для взаимодействия с облаком                                                                                         |
| `backendConfiguration <BackendConfiguration, required>`    | параметры подключения к бакету для хранения стейта. БАКЕТ И СА-КЛЮЧИ СОЗДАЮТСЯ ВРУЧНУЮ! [Структура...](#backend_сonfiguration) |
| `serviceAccounts <ServiceAccount[], optional>`             | массив для создания сервис аккаунтов.  [Структура...](#service_accounts_module)                                                |
| `kmsKeys <Kms[], optional>`                                | массив для создания ключей шифрования.  [Структура...](#kms_keys_module)                                                       |
| `lockboxSecrets <LockboxSecret[], optional>`               | массив для создания хранилища секретов.  [Структура...](#lockbox_secrets_module)                                               |
| `buckets <Bucket[], optional>`                             | массив для создания S3-bucket's. [Структура...](#buckets_module)                                                               |
| `staticIps <StaticIp[], optional>`                         | массив для создания статических IP адресов. [Структура...](#static_ip_module)                                                  |
| `vpcs <Vpc[], optional>`                                   | массив для создания VPC, подсетей. [Структура...](#vpc_module)                                                                 |
| `publicInstances <Instance[], optional>`                   | массив для создания публичных ВМ. [Структура...](#instance_module)                                                             |
| `privateInstances <Instance[], optional>`                  | массив для создания приватных ВМ. [Структура...](#instance_module)                                                             |
| `instanceGroups <InstanceGroup[], optional>`               | массив для создания Instance Groups. [Структура...](#instance_group_module)                                                    |
| `registries <Registry[], optional>`                        | массив для создания Docker-Registry. [Структура...](#container_registry_module)                                                |
| `k8sClusters <Kubernetes[], optional>`                     | массив для создания Kubernetes + аддонов для них. [Структура...](#k8s_module)                                                  |
| `pgClusters <Postgres[], optional>`                        | массив для создания кластеров PostreSQL+ баз данных + пользователей.  [Структура...](#postgres_module)                         |
| `mysqlClusters <Mysql[], optional>`                        | массив для создания кластеров MySQL+ баз данных + пользователей.  [Структура...](#mysql_module)                                |
| `mongoClusters <MongoCluster[], optional>`                 | массив для создания кластеров MongoDB.  [Структура...](#mongodb_module)                                                        |
| `clickHouseClusters <ClickHouseCluster[], optional>`       | массив для создания кластеров ClickHouse.  [Структура...](#clickhouse_module)                                                  |
| `redisClusters <RedisCluster[], optional>`                 | массив для создания кластеров Redis.  [Структура...](#redis_module)                                                            |
| `networkLoadBalancers <NetworkLoadBalancer[], optional>`   | массив для создания NLB.  [Структура...](#nlb_module)                                                                          |

> Значение каждого параметра можно получить из переменных окружения с помошью конструкции `<%= env.ENV_NAME %>`

<a name="backend_сonfiguration"></a>
### Backend Configuration

Конфигурация для бекенда стейта

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                       | Описание                                        |
|--------------------------------|-------------------------------------------------|
| `bucket <string, required>`    | имя бакета (СОЗДАЕТСЯ РУКАМИ❗)                  |
| `accessKey <string, required>` | аксесс кей для доступа в S3 (СОЗДАЕТСЯ РУКАМИ❗) |
| `secretKey <string, required>` | секрет кей для доступа в S3 (СОЗДАЕТСЯ РУКАМИ❗) |
</details>

<a name="service_accounts_module"></a>
### Service Accounts Module

ServiceAccount - создание СА + необходимых ключей

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                    | Описание                                   |
|---------------------------------------------|--------------------------------------------|
| `name <string, required>`                   | имя СА                                     |
| `description <string, required>`            | описание СА                                |
| `createStaticAccessKey <boolean, required>` | флаг для создания статичного ключа доступа |
| `createAccountKey <boolean, required>`      | флаг для создания аккаунт ключа            |
| `reateIamApiKey <boolean, required>`        | флаг для создания Iam-Api ключа            |
| `folderRoles <string[], required>`          | массив ролей в фолдере для СА              |
</details>

<a name="kms_keys_module"></a>
### KmsKeys Module

Kms - создание ключа шифрования

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                             | Описание                                                   |
|------------------------------------------------------|------------------------------------------------------------|
| `name <string, required>`                            | имя ключа                                                  |
| `description <string, required>`                     | описание                                                   |
| `sa <string[], required>`                            | массив имен сервис-аккаунтов связанных с ключем шифрования |
| `algorithm <string, optional, default = AES_256>`    | алгоритм шифрования                                        |
| `rotationPeriod <string, optional, default = 24h>`   | время ротации ключа                                        |
| `labels <map(string,string), optional, default {}>`  | map для лейблов                                            |

</details>

<a name="lockbox_secrets_module></a>
### LockboxSecrets Module

LockboxSecret - создание хранилища секретов LockBox

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                          | Описание                                        |
|-------------------------------------------------------------------|-------------------------------------------------|
| `name <string, required>`                                         | имя ключа                                       |
| `kms <string, required>`                                          | имя ключа шифрования                            |
| `sa <string, required>`                                           | имя сервисного аккаунта для работы с хранилищем |
| `data <map(string,string or LockboxDbSecretTargetRef), required>` | содержимое секрета (возможна работа через ENV)  |
| `description <string, optional, default = null>`                  | описание                                        |
| `labels <map(string,string), optional, default {}>`               | map для лейблов                                 |

#### LockboxDbSecretTargetRef - указание на другой ресурс для получения секрета
| Параметр                         | Описание                                               |
|----------------------------------|--------------------------------------------------------|
| `type <string, required>`        | имя ресурса (postgres, mysql, mongo, clickhouse,redis) |
| `clusterName <string, required>` | имя кластера                                           |
| `userName <string, optional>`    | имя пользователя                                       |

</details>

<a name="buckets_module"></a>
### Buckets Module

Buckets - создание S3-бакетов

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                  | Описание                         |
|-------------------------------------------|----------------------------------|
| `name <string, required>`                 | имя бакета                       |
| `acl <string, required>`                  | acl бакета                       |
| `defaultStorageClass <string, required>`  | стораж класс бакета              |
| `versioning <BucketVersioning, required>` | параметры версионирования бакета |

#### BucketVersioning 

| Параметр                      | Описание    |
|-------------------------------|-------------|
| `enabled <boolean, required>` | надо/ненадо |
</details>

<a name="static_ip_module"></a>
### Static IP Module

StaticIp - создание статических ip-адресов

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                            | Описание                 |
|-----------------------------------------------------|--------------------------|
| `name <string, required, unique>`                   | имя для адреса           |
| `zone <string, required>`                           | зона расположения адреса |
| `labels <map(string,string), optional, default {}>` | map для лейблов          |
</details>

<a name="vpc_module"></a>
### VPC Module

Vpc - создание сетевой инфраструктуры

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                     | Описание                                              |
|--------------------------------------------------------------|-------------------------------------------------------|
| `name <string, required, unique>`                            | имя для сети                                          |
| `publicSubnets <Subnet[], required, if not needed - set []>` | массив публичных подсетей. [Структура...](#subnet_)   |
| `infraSubnets <Subnet[], required, if not needed - set []>`  | массив приватных подсетей. [Структура...](#subnet_)   |
| `addStaticRoute <StaticRoute[], optional, default []>`       | массив дополнительных правил в таблицу маршрутизации  |
| `natData <NatData, required>`                                | конфиги для нат-инстанса. [Структура...](#nat_data)   |
| `labels <map(string, string), optional, default {}>`         | лейблы для VPC                                        |

<a name="subnet_"></a>
#### Subnet - подсеть

| Параметр                                             | Описание                       |
|------------------------------------------------------|--------------------------------|
| `name <string, required, unique>`                    | имя подсети                    |
| `subnet <string, required>`                          | CIDR для подсети               |
| `zone <string, required>`                            | зона в которую залетит подсеть |
| `labels <map(string, string), optional, default {}>` | лейблы для подсети             |

#### StaticRoute - дополнительное правило маршрутизации

| Параметр                          | Описание            |
|-----------------------------------|---------------------|
| `destination <string, required>`  | destination-префикс |
| `next <string, required>`         | next-hop-address    |

<a name="nat_data"></a>
#### NatData - конфиг для Nat-Instance

| Параметр                           | Описание                                             |
|------------------------------------|------------------------------------------------------|
| `enabled <boolean, required>`      | создавать/несоздавать                                |
| `params <NatDataParams, optional>` | конфигурация nat-instance. [Структура...](#nat_conf) |

<a name="nat_conf"></a>
#### NatDataParams - конфиг Nat-Instance

| Параметр                                                                     | Описание                                                                                     |
|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `name <string, required, unique>`                                            | имя ВМ                                                                                       |
| `imageId <string, required>`                                                 | ид имаджа для ВМ                                                                             |
| `subnet <string, required>`                                                  | имя подсети, на которой будет расположена ВМ                                                 |
| `userData <string, optional, default = core/data/cloud_config/default.yaml>` | путь до файла с клауд-конфигом                                                               |
| `bootDiskSize <number, optional, default = 10>`                              | размер диска                                                                                 |
| `bootDiskType <string, optional, default = 'network-hdd'>`                   | тип диска                                                                                    |
| `platformId <string, optional, default = 'standard-v2'>`                     | платформа для развертывания ВМ                                                               |
| `cores <number, optional, default = 2>`                                      | количество ЦПУ                                                                               |
| `allowStoppingForUpdate <boolean, optional, default = false>`                | возможность остановки ВМ для обновления                                                      |
| `memory <number, optional, default = 2>`                                     | количество памяти                                                                            |
| `coreFraction <number, optional, default = 100>`                             | core-Fraction                                                                                |
| `staticIp <string, optional>`                                                | имя статического адреса, который будет предоставлен ВМ, если не указать - будет динамический |
| `preemptible <boolean, optional>`                                            | флаг для создания прерываемой виртуальной машины для Nat                                     |
| `labels <map(string, string), optional, default = {}>`                       | лейблы для ВМ с nat                                                                          |
</details>

<a name="instance_module"></a>
### Instance Module

Instance - описание ВМ
<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                                     | Описание                                                                                     |
|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `name <string, required, unique>`                                            | Имя виртуальной машины                                                                       |
| `imageId <string, required, unique>`                                         | ID образа для ВМ                                                                             |
| `network <string, required, unique>`                                         | Имя VPC в которой будет распологаться ВМ                                                     |
| `subnet <string, required, unique>`                                          | Имя подсети в которой будет распологаться ВМ                                                 |
| `isPublic <boolean, optional, default = false`                               | Флаг для публичного доступа к ВМ                                                             |
| `userData <string, optional, default = core/data/cloud_config/default.yaml>` | путь до файла с клауд-конфигом                                                               |
| `bootDiskSize <number, optional, default = 10>`                              | размер диска                                                                                 |
| `bootDiskType <string, optional, default = 'network-hdd'>`                   | тип диска                                                                                    |
| `resources <InstanceResources, optional>`                                    | описание ресурсов ВМ [Структура...](#instance_resources)                                     |
| `securityGroup <string, optional, default = ''>`                             | имя security-group, которая будет применена к ВМ                                             |
| `staticIp <string, optional>`                                                | имя статического адреса, который будет предоставлен ВМ, если не указать - будет динамический |
| `allowStoppingForUpdate <boolean, optional, default = false>`                | возможность остановки ВМ для обновления                                                      |
| `platformId <string, optional, default = 'standard-v2'>`                     | платформа для развертывания ВМ                                                               |
| `preemptible <boolean, optional>`                                            | флаг для создания прерываемой виртуальной машины                                             |
| `labels <map(string, string), optional, default = {}>`                       | лейблы для ВМ                                                                                |


<a name="instance_resources"></a>
####  Instance Resources

Ресурсы ВМ

| Параметр                                       | Описание       |
|------------------------------------------------|----------------|
| cores <number, optional, default = 2>          | Количество CPU |
| memory <number, optional, default = 2>         | Количество RAM |
| coreFraction <number, optional, default = 100> | CoreFraction   |

</details>


<a name="instance_group_module"></a>
### Instance Group Module

InstanceGroup - описание группы ВМ

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                   | Описание                                                         |
|------------------------------------------------------------|------------------------------------------------------------------|
| name <string, required>                                    | Имя группы ВМ                                                    |
| network <string, required>                                 | Имя VPC для развертывания группы ВМ                              |
| subnet <string, required>                                  | Имя подсети для развертывания группы ВМ                          |
| sa <string, required>                                      | Имя сервис-аккаунта для развертывания группы ВМ                  |
| scalePolicy <InstanceGroupScalePolicy, required>           | Правила масштабирования для группы ВМ                            |
| instanceTemplate <InstanceGroupInstanceTemplate, required> | Описание шаблона ВМ для группы ВМ                                |
| isPublic <boolean, optional, default = false>              | Предоставление публичного доступа для группы ВМ                  |
| lbTargetGroup <InstanceGroupLBTargetGroup, optional>       | Конфигурация таргет-группы сетевого балансировщика для группы ВМ |
| deployPolicy <InstanceGroupDeployPolicy, optional>         | Правила развертывания для группы ВМ                              |
| healthCheck <InstanceGroupHealthCheck, optional>           | Описание хелс-чека для группы ВМ                                 |
| `labels <map(string,string), optional, default = {}>`      | мапа для лейблов которые повешаются на группу ВМ                 |


#### InstanceGroupScalePolicy - правила масштабирования для группы ВМ

| Параметр                                               | Описание                                                                 |
|--------------------------------------------------------|--------------------------------------------------------------------------|
| autoScaleMode <boolean, required>                      | Флаг включения режима автомасштабирования                                |
| size <number, optional, default = 1>                   | Размер группы ВМ для фиксированного режима                               |
| initialSize <number, optional, default = 3>            | Стартовый размер группы ВМ для режима автомасштабирования                |
| measurementDuration <number, optional, default = 60>   | Период снятия метрик с группы ВМ для режима автомасштабирования          |
| cpuUtilizationTarget <number, optional, default = 50>  | Пороговое значение загрузки ЦПУ группы ВМ для режима автомасштабирования |
| minZoneSize <number, optional, default = 1>            | Минимальный размер группы ВМ для режима автомасштабирования              |
| maxSize <number, optional, default = 6>                | Максимальный размер группы ВМ для режима автомасштабирования             |
| warmupDuration <number, optional, default = 60>        | Время прогрева группы ВМ для режима автомасштабирования                  |
| stabilizationDuration <number, optional, default = 60> | Время стабилизации группы ВМ для режима автомасштабирования              |

#### InstanceGroupInstanceTemplate - шаблон ВМ

| Параметр                                                                     | Описание                                         |
|------------------------------------------------------------------------------|--------------------------------------------------|
| name <string, required>                                                      | Имя ВМ                                           |
| hostName <string, required>                                                  | Имя хоста ВМ                                     |
| bootDisk <InstanceGroupInstanceTemplateDisk, required>                       | Параметры загрузочного диска ВМ                  |
| secondaryDisks <InstanceGroupInstanceTemplateDisk, optional, default = []>   | Параметры дополнительных дисков ВМ               |
| resources <InstanceGroupInstanceTemplateResources, optional>                 | Описание ресурсов ВМ                             |
| platformId <string, optional, default = standard-v1>                         | Идентификатор платформы ВМ                       |
| `preemptible <boolean, optional>`                                            | флаг для создания прерываемой виртуальной машины |
| `userData <string, optional, default = core/data/cloud_config/default.yaml>` | путь до файла с клауд-конфигом                   |

#### InstanceGroupInstanceTemplateDisk - конфигурация диска ВМ
| Параметр                                       | Описание                  |
|------------------------------------------------|---------------------------|
| imageId <string, optional>                     | Идентификатор образа ВМ   |
| snapshotId <string, optional>                  | Идентификатор снапшота ВМ |
| mode <string, optional, default = READ_WRITE>  | Режим работы диска        |
| size <number, optional, default = 30>          | Размер диска              |
| type <string, optional, default = network-ssd> | Тип диска                 |

#### InstanceGroupInstanceTemplateResources - описание ресурсов ВМ
| Параметр                                       | Описание       |
|------------------------------------------------|----------------|
| cores <number, optional, default = 2>          | Количество CPU |
| memory <number, optional, default = 4>         | Количество RAM |
| coreFraction <number, optional, default = 100> | CoreFraction   |

#### InstanceGroupLBTargetGroup - конфигурация таргет-группы для сетевого балансировщика
| Параметр                                                  | Описание                         |
|-----------------------------------------------------------|----------------------------------|
| enabled <boolean, required>                               | Флаг для создания таргет-группы  |
| name <string, optional>                                   | Имя таргет-группы                |
| description <string, optional>                            | Описание таргет-группы           |
| maxOpeningTrafficDuration <number, optional, default = 5> | Время открытия трафика (секунды) |

#### InstanceGroupDeployPolicy - параметры развертывания группы ВМ
| Параметр                                         | Описание                                                    |
|--------------------------------------------------|-------------------------------------------------------------|
| maxUnavailable <number, optional, default = 1>   | Максимальное количество недоступных ВМ                      |
| maxExpansion <number, optional, default = 1>     | Максимальное превышение количества ВМ в процессе обновления |
| maxDeleting <number, optional, default = 1>      | Максимальное количество удаляемых ВМ                        |
| maxCreating <number, optional, default = 3>      | Максимальное количество создаваемых ВМ                      |
| startupDuration <number, optional, default = 60> | Время прогрева ВМ                                           |
| strategy <string, optional, default = proactive> | Стратегия развертывания ВМ                                  |

#### InstanceGroupHealthCheck - конфигурация хелс-чека для группы ВМ
| Параметр                                           | Описание                                         |
|----------------------------------------------------|--------------------------------------------------|
| type <string, required>                            | Тип хелс-чека (TCP / HTTP)                       |
| port <number, required>                            | Порт ВМ для хелс-чека                            |
| interval <number, optional, default = 15>          | Интервал хелс-чека                               |
| timeout <number, optional, default = 5>            | Таймаут хелс-чека                                |
| healthyThreshold <number, optional, default = 2>   | Количество целевых успешных проверок хелс-чека   |
| unhealthyThreshold <number, optional, default = 5> | Количество целевых неуспешных проверок хелс-чека |
| path <string, optional, default = / >              | URL запроса для HTTP хелс-чека                   |

</details>

<a name="container_registry_module"></a>
### Container Registry Module

Registry - описание Container-Registry

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                              | Описание                                                   |
|-------------------------------------------------------|------------------------------------------------------------|
| `name <string, required, unique>`                     | имя для Registry                                           |
| `allowedPushIps <string[], optional>`                 | массив ip-адресов для предоставления доступа на push       |
| `allowedPullIps <string[], optional>`                 | массив ip-адресов для предоставления доступа на pull       |
| `allowedPushSa <RegistrySA[], optional>`              | массив сервис-аккаунтов для предоставления доступа на push |
| `allowedPullSa <RegistrySA[], optional>`              | массив сервис-аккаунтов для предоставления доступа на pull |
| `labels <map(string,string), optional, default = {}>` | мапа для лейблов которые повешаются на Registry            |

#### RegistrySA

| Параметр                      | Описание                                                    |
|-------------------------------|-------------------------------------------------------------|
| `name <string, required>`     | имя сервис-аккаунта                                         |
| `folderId <string, optional>` | id каталога облака для предоставления доступа стороннему СА |

</details>

<a name="k8s_module"></a>
### K8S Module

Kubernetes - описание K8S-кластера

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                                   | Описание                                                                                                                       |
|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `name <string, required, unique>`                                          | имя кластера                                                                                                                   |
| `network <string, required>`                                               | имя VPC на которой будет развернут кластер                                                                                     |
| `subnet <string, required>`                                                | имя подсети на которой будет развернут кластер                                                                                 |
| `clusterSa <string, required>`                                             | имя сервис-аккаунта для мастер-нод                                                                                             |
| `nodesSa <string, required>`                                               | имя сервис-аккаунта для рабочих узлов кластера                                                                                 |
| `workerGroups <KubernetesWorkerGroup[], required, if not needed - set []>` | массив описания групп рабочих узлов. [Структура...](#k8s_worker_group)                                                         |
| `addons <KubernetesAddons, required>`                                      | описание дополнительных компонентов для установки в кластер (ingress, cert-manager, kubeDashbord). [Структура...](#k8s_addons) |
| `isPublic <bollean, optiona, default true>`                                | публичный ли доступ к Api-мастера                                                                                              |
| `version <string, optional, default 1.23>`                                 | версия Kubernetes                                                                                                              |
| `additionalParams <KubernetesAdditionalParams, optional>`                  | дополнительная конфигурация кластера. [Структура...](#k8s_addidional_param)                                                    |
| `labels <map(string,string), optional, default = {}>`                      | лейблы для кластера                                                                                                            |

<a name="k8s_addidional_param"></a>
#### KubernetesAdditionalParams - дополнительная конфигурация кластера (нужно если ставим больше 1 кластера в сеть)

| Параметр           | Описание          |
|--------------------|-------------------|
| `clusterIpv4Range` | CIDR для подов    |
| `serviceIpv4Range` | CIDR для сервисов |

<a name="k8s_worker_group"></a>
#### KubernetesWorkerGroup - описание групп рабочих ущлов для кластера

| Параметр                                                   | Описание                                                                                 |
|------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `name <string, required>`                                  | имя воркер-группы                                                                        |
| `instanceName <string, required>`                          | темплейт для имени конкретного инстанса                                                  |
| `scalePolicy <KubernetesWorkerGroupScalePolicy, optional>` | параметры для управлением количества нод и автоскейлом [Структура...](#k8s_scale_policy) |
| `platformId <string, optional, default standard-v2>`       | id платформы для инстансов                                                               |
| `version <string, optional, default 1.23>`                 | версия k8s на инстансах                                                                  |
| `preepmtible <boolean, optional, default false>`           | прерываемые ли ВМ                                                                        |
| `nodeLabels <map(string,string), optional, default {}>`    | набор лейблов для нод кластера                                                           |
| `nodeTaints <string[], optional, default[]>`               | массив теинтов на нодах для scheduling                                                   |
| `resources <KubernetesWorkerGroupResources, optional>`     | ресурсы для нод кластера [Структура](#k8s_worker_group_resources)                        |
| `nat <boolean, optional, default false>`                   | включать ли нат на нодах                                                                 |
| `autoUpgrade <boolean, optional, default false>`           | включать ли автоапгрейд                                                                  |
| `autoRepair <boolean, optional, default false>`            | включать ли авторепеир                                                                   |
| `labels <map(string,string), optional, default {}>`        | лейблы для группы узлов                                                                  |


<a name="k8s_scale_policy"></a>
#### KubernetesWorkerGroupScalePolicy - параметры для скалирования/размера

| Параметр                                           | Описание                        |
|----------------------------------------------------|---------------------------------|
| `autoScaleMode <boolean, optional, default false>` | включать ли автомасштабирование |
| `fixedScaleSize <number, optional, default 3>`     | размер пула для фиксед-скейла   |
| `autoScaleMin <number, optional, default 1>`       | мин размер для автоскейла       |
| `autoScaleMax <number, optional, default 3>`       | макс размер для автоскейла      |
| `autoScaleInitial <number, optional, default 1>`   | инит размер для автоскейла      |


<a name="k8s_worker_group_resources"></a>
#### KubernetesWorkerGroupResources - описание ресурсов для нод кластера

| Параметр                                           | Описание                 |
|----------------------------------------------------|--------------------------|
| `memory <number, optional, default 16>`            | объем памяти             |
| `cpu <number, optional, default 2>`                | количество ядер          |
| `diskSize <number, optional, default 30>`          | размер диска             |
| `diskType <string, optional, default network-hdd>` | тип диска                |



<a name="k8s_addons"></a>
#### KubernetesAddons - конфигурация доп компонентов для установки в кластер

| Параметр                                                | Описание                                                                                               |
|---------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `ingress <KubernetesAddonsIngress, optional>`           | описание установки ingress-nginx-контроллера. [Структура...](#k8s_addons_ingress)                      |
| `certManager <KubernetesAddonsCertManager, optional>`   | описание установки cert-manager. [Структура...](#k8s_addons_cert)                                      |
| `dashboard <KubernetesAddonsDashboard, optional>`       | описание установки KubeDashbord. [Структура...](#k8s_addons_dash)                                      |
| `s3Storage <KubernetesS3Storage, optional>`             | описание установки s3-storage-class в кластер. [Структура...](#k8s_addons_s3)                          |
| `lockboxOperator <KubernetesLockboxOperator, optional>` | описание установки оператора для синхронизации секретов в кластер. [Структура...](#k8s_addons_lockbox) |
| `manifests <KubernetesAdditionalManifest, optional>`    | описание установки дополнительных манифестов в кластер. [Структура...](#k8s_addons_manifests)          |

<a name="k8s_addons_ingress"></a>
#### KubernetesAddonsIngress - конфигурация Nginx-ingress-контроллера

| Параметр                                                                 | Описание                                                                                            |
|--------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| `enabled <boolean, required>`                                            | ставить/неставить                                                                                   |
| `chartVersion <string, optional, default 4.6.0>`                         | версия Helm-Chart                                                                                   |
| `values <string, optional, default core/data/values/ingress-nginx.yaml>` | путь до файла с значениями для Helm-Chart                                                           |
| `staticIp <string, optional, default ‘’>`                                | имя статического ip-адреса если надо повешать на балансер, если не указать - создастся динамический |
| `set <KubernetesHelmReleaseSet[], optional, default []>`                 | массив сетов для Helm-Chart. [Структура...](#k8s_helm)                                              |


<a name="k8s_addons_cert"></a>
#### KubernetesAddonsCertManager - конфигурация Cert-Manager

| Параметр                                                                        | Описание                                               |
|---------------------------------------------------------------------------------|--------------------------------------------------------|
| `enabled <boolean, required>`                                                   | ставить или нет                                        |
| `chartVersion <string, optional, default v1.11.0>`                              | версия Helm-Chart                                      |
| `values <string, optional, default core/data/values/cert-manager.yaml>`         | путь до файла с значениями для Helm-Chart              |
| `set <KubernetesHelmReleaseSet[], optional, default []>`                        | массив сетов для Helm-Chart. [Структура...](#k8s_helm) |
| `issuerData <string, optional, default core/data/manifests/clusterissuer.yaml>` | путь до файла с манифестом для cluster-isshuer         |

<a name="k8s_addons_dash"></a>
#### KubernetesAddonsDashboard - конфигурация для Kubernetes-Dashboard

| Параметр                                                             | Описание                                               |
|----------------------------------------------------------------------|--------------------------------------------------------|
| `enabled <boolean, required>`                                        | ставить или нет                                        |
| `chartVersion <string, optional, default 6.0.7>`                     | версия для Helm-Chart                                  |
| `values <string, optional, default core/data/values/dashboard.yaml>` | путь до файла с значением для Helm-Chart               |
| `set <KubernetesHelmReleaseSet[], optional, default []>`             | массив сетов для Helm-Chart. [Структура...](#k8s_helm) |
| `createAdmin <boolean, optional, default false>`                     | создавать ли пользователя + токен для доступа к борде  |

<a name="k8s_addons_lockbox"></a>
#### KubernetesLockboxOperator - конфигурация оператора для синхронизации секретов

| Параметр                                                           | Описание                                               |
|--------------------------------------------------------------------|--------------------------------------------------------|
| `enabled <boolean, required>`                                      | ставить или нет                                        |
| `secretStores <KubernetesLockboxClusterSecretStore[], optional>`   | создание массива хранилищ секретов в кластере          |
| `chartVersion <string, optional, default 0.9.1>`                   | версия Helm-Chart                                      |
| `values <string, optional, default core/data/values/lockbox.yaml>` | путь до файла с значениями для Helm-Chart              |
| `set <KubernetesHelmReleaseSet[], optional, default []>`           | массив сетов для Helm-Chart. [Структура...](#k8s_helm) |

#### KubernetesLockboxClusterSecretStore - массив хранилищ секретов
[Подробнее...](https://cloud.yandex.ru/docs/lockbox/tutorials/kubernetes-lockbox-secrets)

[Документация ClusterSecretStore...](https://external-secrets.io/v0.9.1/api/clustersecretstore/)

| Параметр                   | Описание                      |
|----------------------------|-------------------------------|
| `name <string, required>`  | имя хранилища внутри кластера |
| `sa <string, required>`    | имя связанного СА             |

<a name="k8s_helm"></a>
#### KubernetesHelmReleaseSet - сеты для Helm-Chart

| Параметр                   | Описание            |
|----------------------------|---------------------|
| `name <string, required>`  | имя переменной      |
| `value <string, required>` | значение переменной |


<a name="k8s_addons_manifests"></a>
#### KubernetesAdditionalManifest - дополнительные манифесты

| Параметр                  | Описание           |
|---------------------------|--------------------|
| `name <string, required>` | имя манифеста      |
| `path <string, required>` | путь до yaml-файла |
</details>


<a name="postgres_module"></a>
### Postgres Module

PostgresCluster - конфигурация посгрес-кластера

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                         | Описание                                                                   |
|------------------------------------------------------------------|----------------------------------------------------------------------------|
| `name <string, required, unique>`                                | имя кластера                                                               |
| `network <string, required>`                                     | имя сети в которой будет развернут кластер                                 |
| `host <PostgresHost, required>`                                  | описание хоста кластера                                                    |
| `databases <PostgresDatabase[], required, if not needed set []>` | массив баз данных для создания в кластере                                  |
| `version <string, optional, default = 12>`                       | версия Postgres                                                            |
| `environment <string, optional. default = PRODUCTION>`           | имя окружения                                                              |
| `resources <PostgresClusterResources, optional>`                 | ресурсы для кластера                                                       |
| `access <PostgresAccessConfig, optional>`                        | предоставление дополнительных доступов к кластеру (для отдельных сервисов) |
| `addUsers <PostgresAddUser[], optiona, default = []>`            | массив дополнительных пользователей в кластере посгреса                    |
| `labels <map(string,string), optional, default {}>`              | лейблы для кластера                                                        |

#### PostgresHost - описание хоста кластера
| Параметр                                        | Описание                                                    |
|-------------------------------------------------|-------------------------------------------------------------|
| `subnet <string, required>`                     | имя подсети, на которой будет развернут хост кластера       |
| `isPublic <boolean, optional, default = false>` | флаг для предоставления публичного доступа к хосту кластера |

#### PostgresAccessConfig - предоставление дополнительных доступов к кластеру
| Параметр                                            | Описание                                 |
|-----------------------------------------------------|------------------------------------------|
| `dataLens <boolean, optional, default = false>`     | Предоставление доступов для DataLens     |
| `webSql <boolean, optional, default = false>`       | Предоставление доступов для WebSQL       |
| `dataTransfer <boolean, optional, default = false>` | Предоставление доступов для DataTransfer |
| `serverless <boolean, optional, default = false>`   | Предоставление доступов для Serverless   |




#### PostgresCLusterResources - описание ресурсов для кластера

| Параметр                                                  | Описание                                            |
|-----------------------------------------------------------|-----------------------------------------------------|
| `resourcePresetId <string, optional, default = s2.micro>` | имя пресета конфигурации для кластера (cpu, память) |
| `diskSize <number, optional, default = 10>`               | размер диска                                        |
| `diskTypeId <string, optional, default = network-hdd>`    | тип диска                                           |

#### PostgresDatabase - описание базы данных для создания внутри кластера

| Параметр                                       | Описание                                      |
|------------------------------------------------|-----------------------------------------------|
| `userName <string, required>`                  | имя owner для базы                            |
| `dbName <string, required>`                    | имя базы данных                               |
| `connLimit <number, optional, default 10>`     | лимит connections к базе                      |
| `userGrants <string[], optional, default []>`  | массив доп грантов которые будут выданы owner |
| `extenstions <string[], optional, default []>` | набор extenstions которые поставятся в базу   |


#### PostgresAddUser - дополнительные пользователи для кластера

| Параметр                                           | Описание                                                 |
|----------------------------------------------------|----------------------------------------------------------|
| `name <string, required>`                          | имя пользователя                                         |
| `connLimit <number, optional, default 10>`         | лимит connections                                        |
| `userGrants <string[], optional, default []>`      | массив грантов для пользователя                          |
| `databasesAccess <string[], optional, default []>` | массив имен БД к которым пользователь будет иметь доступ |
</details>

<a name="mysql_module"></a>
### MySQL Module

MysqlCluster - описание кластера MySQL

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                 | Описание                                                                           |
|----------------------------------------------------------|------------------------------------------------------------------------------------|
| `name <string, required, unique>`                        | имя кластера                                                                       |
| `network <string, required>`                             | имя сети в которой будет развернут кластер                                         |
| `host <MysqlHost, required>`                             | описание хоста кластера                                                            |
| `databases <MysqlDatabases[], required>`                 | массив баз данных для создания в кластере                                          |
| `version <string, optional, default = '8.0'>`            | версия MySQL                                                                       |
| `environment <string, optional, default = 'PRODUCTION'>` | имя окружения                                                                      |
| `resources <MysqlClusterResources, optional>`            | описание ресурсов кластера                                                         |
| `access <MysqlAccess, optional>`                         | предоставление дополнительных доступов к кластеру (DataLens, DataTransfer, WebSQL) |
| `addUsers <MysqlAddUser, optional, default = []>`        | массив дополнительных пользователей в кластере                                     |
| `labels <map(string,string), optional, default {}>`      | лейблы для кластера                                                                |

#### MysqlHost - описание хоста кластера
| Параметр                                        | Описание                                                    |
|-------------------------------------------------|-------------------------------------------------------------|
| `subnet <string, required>`                     | имя подсети, на которой будет развернут хост кластера       |
| `isPublic <boolean, optional, default = false>` | флаг для предоставления публичного доступа к хосту кластера |

#### MysqlAccess - предоставление дополнительных доступов к кластеру
| Параметр                                            | Описание                                 |
|-----------------------------------------------------|------------------------------------------|
| `dataLens <boolean, optional, default = false>`     | Предоставление доступов для DataLens     |
| `webSql <boolean, optional, default = false>`       | Предоставление доступов для WebSQL       |
| `dataTransfer <boolean, optional, default = false>` | Предоставление доступов для DataTransfer |

#### MysqlClusterResources - описание ресурсов кластера

| Параметр                                                  | Описание                                            |
|-----------------------------------------------------------|-----------------------------------------------------|
| `resourcePresetId <string, optional, default = s2.micro>` | имя пресета конфигурации для кластера (cpu, память) |
| `diskSize <number, optional, default = 10>`               | размер диска                                        |
| `diskTypeId <string, optional, default = network-hdd>`    | тип диска                                           |

#### MysqlDatabase - описание базы данных для создания внутри кластера

| Параметр                                       | Описание                                      |
|------------------------------------------------|-----------------------------------------------|
| `userName <string, required>`                  | имя owner для базы                            |
| `dbName <string, required>`                    | имя базы данных                               |
| `connLimit <number, optional, default 10>`     | лимит connections к базе                      |


#### MysqlAddUser - дополнительные пользователи для кластера

| Параметр                                                   | Описание                        |
|------------------------------------------------------------|---------------------------------|
| `name <string, required>`                                  | имя пользователя                |
| `databasesAccess <MysqlAddUserDatabaseAccess[], required>` | описание доступов до баз данных |
| `connLimit <number, optional, default 10>`                 | лимит connections к базе        |

#### MysqlAddUserDatabaseAccess - конфигурация доступов пользователя до баз данных

| Параметр                     | Описание                                               |
|------------------------------|--------------------------------------------------------|
| `dbName <string, required>`  | имя базы данных                                        |
| `roles <string[], required>` | массив ролей для пользователя (ALL, Select, Update...) |

</details>


<a name"mongodb_module"></a>
### MongoDB Module

MongoCluster - описание кластера MongoDB

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                 | Описание                                                                   |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| `name <string, required, unique>`                        | имя кластера                                                               |
| `network <string, required>`                             | имя сети в которой будет развернут кластер                                 |
| `host <MongoHost, required>`                             | описание хоста кластера                                                    |
| `databases <MongoDatabases[], required>`                 | массив баз данных для создания в кластере                                  |
| `version <string, optional, default = '6.0'>`            | версия MongoDB                                                             |
| `environment <string, optional, default = 'PRODUCTION'>` | имя окружения                                                              |
| `resources <MongoClusterResources, optional>`            | описание ресурсов кластера                                                 |
| `access <MongoAccess, optional>`                         | предоставление дополнительных доступов к кластеру (DataLens, DataTransfer) |
| `addUsers <MongoAddUser, optional, default = []>`        | массив дополнительных пользователей в кластере                             |
| `labels <map(string,string), optional, default {}>`      | лейблы для кластера                                                        |

#### MongoHost - описание хоста кластера
| Параметр                                        | Описание                                                    |
|-------------------------------------------------|-------------------------------------------------------------|
| `subnet <string, required>`                     | имя подсети, на которой будет развернут хост кластера       |
| `isPublic <boolean, optional, default = false>` | флаг для предоставления публичного доступа к хосту кластера |

#### MongoAccess - предоставление дополнительных доступов к кластеру
| Параметр                                            | Описание                                 |
|-----------------------------------------------------|------------------------------------------|
| `dataLens <boolean, optional, default = false>`     | Предоставление доступов для DataLens     |
| `dataTransfer <boolean, optional, default = false>` | Предоставление доступов для DataTransfer |

#### MongoClusterResources - описание ресурсов кластера

| Параметр                                                  | Описание                                            |
|-----------------------------------------------------------|-----------------------------------------------------|
| `resourcePresetId <string, optional, default = s2.micro>` | имя пресета конфигурации для кластера (cpu, память) |
| `diskSize <number, optional, default = 10>`               | размер диска                                        |
| `diskTypeId <string, optional, default = network-hdd>`    | тип диска                                           |

#### MongoDatabase - описание базы данных для создания внутри кластера

| Параметр                                       | Описание                                      |
|------------------------------------------------|-----------------------------------------------|
| `userName <string, required>`                  | имя owner для базы                            |
| `dbName <string, required>`                    | имя базы данных                               |

#### MongoAddUser - дополнительные пользователи для кластера

| Параметр                                          | Описание                        |
|---------------------------------------------------|---------------------------------|
| `userName <string, required>`                     | имя пользователя                |
| `permissions <MongoUserPermission[], required>`   | описание доступов до баз данных |

#### MongoUserPermission - конфигурация доступов пользователя до баз данных

| Параметр                                              | Описание                                |
|-------------------------------------------------------|-----------------------------------------|
| `dbName <string, required>`                           | имя базы данных                         |
| `roles <string[], optional, default = ['readWrite']>` | массив ролей пользователя в базе данных |
</details>

<a name"clickhouse_module"></a>
### ClickHouse Module

ClickHouseCluster - описание кластера ClickHouse

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                 | Описание                                                                              |
|----------------------------------------------------------|---------------------------------------------------------------------------------------|
| `name <string, required, unique>`                        | имя кластера                                                                          |
| `network <string, required>`                             | имя сети в которой будет развернут кластер                                            |
| `host <ClickHouseHost, required>`                        | описание хоста кластера                                                               |
| `databases <ClickHouseDatabase[], required>`             | массив баз данных для создания в кластере                                             |
| `version <string, optional, default = '23.3'>`           | версия ClickHouse                                                                     |
| `environment <string, optional, default = 'PRODUCTION'>` | имя окружения                                                                         |
| `resources <ClickHouseResources, optional>`              | описание ресурсов кластера                                                            |
| `access <ClickHouseAccess, optional>`                    | предоставление дополнительных доступов к кластеру (DataLens, DataTransfer, webSql...) |
| `addUsers <ClickHouseAddUser, optional, default = []>`   | массив дополнительных пользователей в кластере                                        |
| `labels <map(string,string), optional, default {}>`      | лейблы для кластера                                                                   |

#### ClickHouseHost - описание хоста кластера
| Параметр                                        | Описание                                                    |
|-------------------------------------------------|-------------------------------------------------------------|
| `subnet <string, required>`                     | имя подсети, на которой будет развернут хост кластера       |
| `isPublic <boolean, optional, default = false>` | флаг для предоставления публичного доступа к хосту кластера |

#### ClickHouseAccess - предоставление дополнительных доступов к кластеру
| Параметр                                               | Описание                                  |
|--------------------------------------------------------|-------------------------------------------|
| `dataLens <boolean, optional, default = false>`        | Предоставление доступов для DataLens      |
| `dataTransfer <boolean, optional, default = false>`    | Предоставление доступов для DataTransfer  |
| `webSql <boolean, optional, default = false>`          | Предоставление доступов для WebSQL        |
| `metrika <boolean, optional, default = false>`         | Предоставление доступов для YandexMetrika |
| `yandexQuery <boolean, optional, default = false>`     | Предоставление доступов для YandexQuery   |
| `serverless <boolean, optional, default = false>`      | Предоставление доступов для Serverless    |

#### ClickHouseResources - описание ресурсов кластера

| Параметр                                                  | Описание                                            |
|-----------------------------------------------------------|-----------------------------------------------------|
| `resourcePresetId <string, optional, default = s3-c2-m8>` | имя пресета конфигурации для кластера (cpu, память) |
| `diskSize <number, optional, default = 10>`               | размер диска                                        |
| `diskTypeId <string, optional, default = network-ssd>`    | тип диска                                           |

#### ClickHouseDatabase - описание базы данных для создания внутри кластера

| Параметр                                       | Описание                                      |
|------------------------------------------------|-----------------------------------------------|
| `userName <string, required>`                  | имя owner для базы                            |
| `dbName <string, required>`                    | имя базы данных                               |

#### ClickHouseAddUser - дополнительные пользователи для кластера

| Параметр                         | Описание                                  |
|----------------------------------|-------------------------------------------|
| `userName <string, required>`    | имя пользователя                          |
| `databases <string[], required>` | массив имен БД для предоставления доступа |

</details>

<a name"redis_module"></a>
### Redis Module

RedisCluster - описание кластера Redis

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                 | Описание                                   |
|----------------------------------------------------------|--------------------------------------------|
| `name <string, required, unique>`                        | имя кластера                               |
| `network <string, required>`                             | имя сети в которой будет развернут кластер |
| `host <RedisHost, required>`                             | описание хоста кластера                    |
| `version <string, optional, default = '7.0'>`            | версия Redis                               |
| `environment <string, optional, default = 'PRODUCTION'>` | имя окружения                              |
| `resources <RedisClusterResources, optional>`            | описание ресурсов кластера                 |
| `databases <number, optional, default = 1>`              | количество баз данных в кластере           |
| `persistence <string OFF\|ON, optional, default = ON>`   | persistence режим                          |
| `tlsEnabled <boolean, optional, default = false>`        | поддержка TLS                              |
| `labels <map(string,string), optional, default {}>`      | лейблы для кластера                        |

#### RedisHost - описание хоста кластера
| Параметр                                        | Описание                                                    |
|-------------------------------------------------|-------------------------------------------------------------|
| `subnet <string, required>`                     | имя подсети, на которой будет развернут хост кластера       |
| `isPublic <boolean, optional, default = false>` | флаг для предоставления публичного доступа к хосту кластера |


#### RedisClusterResources - описание ресурсов кластера

| Параметр                                                   | Описание                                            |
|------------------------------------------------------------|-----------------------------------------------------|
| `resourcePresetId <string, optional, default = hm3-c2-m8>` | имя пресета конфигурации для кластера (cpu, память) |
| `diskSize <number, optional, default = 16>`                | размер диска                                        |
| `diskTypeId <string, optional, default = network-ssd>`     | тип диска                                           |

</details>

<a name="nlb_module"></a>
### NLB Module

NetworkLoadBalancer - описание сетевого балансировщика нагрузки

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                      | Описание                           |
|---------------------------------------------------------------|------------------------------------|
| `name <string, required, unique>`                             | имя балансировщика                 |
| `type <string internal/external, required>`                   | тип балансировщика                 |
| `listeners <NetworkLoadBalancerListener[], required`          | описание массива листенеров        |
| `targetGroupRef <NetworkLoadBalancerTargetGroupRef, required` | ссылка на созданную целевую группу |
| `labels <map(string,string), optional, default {}>`           | лейблы для балансировщика          |

#### NetworkLoadBalancerListener - описание листенера для балансировщика

| Параметр                                                                 | Описание                                            |
|--------------------------------------------------------------------------|-----------------------------------------------------|
| `name <string, required, unique>`                                        | имя листенера                                       |
| `port <number, required>`                                                | порт                                                |
| `targetPort <number, optional>`                                          | таргер-порт                                         |
| `protocol <string, optional>`                                            | протокол                                            |
| `internalAddress <NetworkLoadBalancerListenerInternalAddress, optional>` | конфигурация ip-адресса для internal-балансировщика |
| `externalAddress <NetworkLoadBalancerListenerExternalAddress, optional>` | конфигурация ip-адресса для external-балансировщика |

#### NetworkLoadBalancerListenerInternalAddress - конфигурация внутреннего ip-адреса

| Параметр                                       | Описание                             |
|------------------------------------------------|--------------------------------------|
| `network <string, required>`                   | имя VPC для размещения ip-адреса     |
| `subnet <string, required>`                    | имя подсети для размещения ip-адреса |
| `adress <string, optional>`                    | фиксированный ip-адреса              |
| `ipVersion <string, optional, default = ipv4>` | версия ip-адреса                     |

#### NetworkLoadBalancerListenerExternalAddress - конфигурация внешнего ip-адреса

| Параметр                                       | Описание                                 |
|------------------------------------------------|------------------------------------------|
| `address <string, optional>`                   | имя существующего статического ip-адреса |
| `ipVersion <string, optional, default = ipv4>` | версия ip-адреса                         |

#### NetworkLoadBalancerTargetGroupRef - ссылка на созданную таргет-группу (пока подеррживается только instanceGroup)

| Параметр                                                            | Описание                                     |
|---------------------------------------------------------------------|----------------------------------------------|
| `resourceType <string, required>`                                   | тип ресурса                                  |
| `resourceName <string, required>`                                   | имя ресурса                                  |
| `healthCheck <NetworkLoadBalancerTargetGroupHealthCheck, required>` | конфигурация хелс-чека для балансировщика    |

#### NetworkLoadBalancerTargetGroupHealthCheck

| Параметр                                           | Описание                                         |
|----------------------------------------------------|--------------------------------------------------|
| type <string, required>                            | Тип хелс-чека (TCP / HTTP)                       |
| port <number, required>                            | Порт ВМ для хелс-чека                            |
| interval <number, optional, default = 15>          | Интервал хелс-чека                               |
| timeout <number, optional, default = 5>            | Таймаут хелс-чека                                |
| healthyThreshold <number, optional, default = 2>   | Количество целевых успешных проверок хелс-чека   |
| unhealthyThreshold <number, optional, default = 5> | Количество целевых неуспешных проверок хелс-чека |
| path <string, optional, default = / >              | URL запроса для HTTP хелс-чека                   |

</details>