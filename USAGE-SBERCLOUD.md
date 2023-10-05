## Структура StackConfig для SberCloud

| Параметр                                                | Описание                                                                                   |
|---------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `accessKey <string, required>`                          | AccessKey для взаимодействия с API (создается вручную)                                     |
| `secretKey <string, required>`                          | SecretKey для взаимодействия с API (создается вручную)                                     |
| `projectId <string, required>`                          | Идентификатор проекта в облаке                                                             |
| `backendConfiguration <BackendConfiguration, required>` | Параметры подключения к бакету для хранения стейта. [Структура...](#backend_configuration) |
| `iamUsers <IamUser[], optional>`                        | Массив для создания IAM-пользователей [Структура...](#iam_users)                           |
| `registries <Registry[], optional>`                     | Массив для создания Container-Registry [Структура...](#registry)                           |
| `buckets <Bucket[], optional>`                          | Массив для создания S3-бакеотов [Структура...](#buckets)                                   |
| `staticIpConfig <StaticIpConfig, optional>`             | Конфигурация ElasticIP и ShareBandWidth [Структура...](#static_ip)                         |
| `keyPairs <keyPairs[], optional>`                       | Массив для создания пар ssh-ключей [Структура...](#key_pairs)                              |
| `secGroups <SecGroup[], optional>`                      | Массив для создания пар security-групп [Структура...](#sec_groups)                         |
| `k8sClusters <KubernetesCluster[], optional>`           | Массив для создания kubernetes-кластеров [Структура...](#k8s)                              |
| `pgClusters <PostgresCluster[], optional>`              | Массив для создания postgres-кластеров [Структура...](#postgres)                           |
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


<a name="static_ip"></a>
### StaticIp Module

StaticIpConfig - создание ElasticIP и BandWidth

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                        | Описание                        |
|-------------------------------------------------|---------------------------------|
| `staticIps <StaticIp[], optional>`              | массив для создания ElasticIp   |
| `shareBandwidths <SharedBandwidth[], optional>` | массив для создания BandWidth   |

#### ShareBandWidth
| Параметр                                 | Описание         |
|------------------------------------------|------------------|
| `name <string, required>`                | имя BandWidth    |
| `size <number, optional, default = 10>`  | размер BandWidth |

#### StaticIp
| Параметр                                           | Описание                                               |
|----------------------------------------------------|--------------------------------------------------------|
| `name <string, required>`                          | имя ElasticIp                                          |
| `shareType <string, required, PER or WHOLE>`       | использование созданного BandWidth или создание нового |
| `bandwidthName <string, required>`                 | имя BandWidth                                          |
| `type <string, optional, default = 5_bgp>`         | тип ElasticIp                                          |
| `chargeMode <string, optional, default = traffic>` | способ тарификации для ElasticIp                       |
| `size <number, optional, default = 10>`            | размер BandWidth (при создании)                        |
</details>

<a name="key_pairs"></a>
### KeyPairs Module

KeyPair - создание пар ssh-ключей

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                        | Описание                          |
|---------------------------------|-----------------------------------|
| `name <string, required>`       | имя пары ключей                   |
| `publicKey <string, optional>`  | значение public-ключа             |
| `privateKey <string, optional>` | путь для сохранения private-ключа |
</details>


<a name="vpc"></a>
### VPC Module

Vpc - создание сетевой инфраструктуры

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                            | Описание                       |
|-----------------------------------------------------|--------------------------------|
| `name <string, required>`                           | имя VPC                        |
| `cidr <string, required>`                           | cidr для VPC                   |
| `publicSubnet <Subnet, required>`                   | конфигурация публичной подсети |
| `internalSubnet <Subnet, required>`                 | конфигурация приватной подсети |
| `nat <VpcNatConfig, optional>`                      | конфигурация nat для VPC       |
| `labels <map(string,string), optional, default {}>` | набор тэгов для VPC            |

#### Subnet - конфигурация подсети

| Параметр                                                 | Описание                        |
|----------------------------------------------------------|---------------------------------|
| `name <string, required>`                                | имя подсети                     |
| `cidr <string, required>`                                | cidr подсети                    |
| `gatewayIp <string, required>`                           | ip-адрес gateway для подсети    |
| `primaryDns <string, optional, default = 100.125.13.59>` | адрес primary-dns для подсети   |
| `secondaryDns <string, optional, default = 8.8.8.8>`     | адрес secondary-dns для подсети |
| `labels <map(string,string), optional, default {}>`      | набор тэгов для подсети         |

#### VpcNatConfig - конфигурация nat для VPC

| Параметр                               | Описание               |
|----------------------------------------|------------------------|
| `enabled <boolean, required>`          | флаг для включения nat |
| `elasticIp <string, required>`         | имя elasticIp для nat  |
| `spec <string, optional, default = 1>` | тип nat                |
</details>

<a name="sec_groups"></a>

### SecurityGroups Module

SecGroup - описание security-группы

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                           | Описание                         |
|------------------------------------|----------------------------------|
| `name <string, required>`          | имя security-группы              |
| `rules <SecGroupRule[], required>` | набор правил для security-группы |

#### SecGroupRule
| Параметр                                       | Описание                                           |
|------------------------------------------------|----------------------------------------------------|
| `direction <string, required>`                 | direction для правила (ingress, egress)            |
| `remoteCidr <string, required>`                | cidr к которому будет применено правило            |
| `ethertype <string, optional, default = IPv4>` | версия ip                                          |
| `protocol <string, optional, default = tcp>`   | протокол                                           |
| `portRangeMin <number, optional>`              | минимальный порт в диапазоне                       |
| `portRangeMax <number, optional>`              | максимальный порт в диапазоне                      |
| `ports <string, optional>`                     | описание портов для правила в произвольном формате |

</details>

<a name="k8s"></a>

### Kubernetes Module

KubernetesCluster - описание кластера Kubernenets

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                        | Описание                                                   |
|-----------------------------------------------------------------|------------------------------------------------------------|
| `name <string, required>`                                       | имя кластера                                               |
| `network <string, required>`                                    | имя vpc, в которой будет развернут кластер                 |
| `subnet <string, required>`                                     | имя подсети, в которой будет развернут кластер             |
| `nodeGroups <KubernetesNodeGroup[], required>`                  | массив для конфигурации групп рабочих узлов кластера       |
| `availabilityZone <string, optional, default = ru-moscow-1a>`   | зона доступности кластера                                  |
| `flavorId <string, optional, default = cce.s1.small>`           | flavor-id для мастера                                      |
| `version <string, optional, default = 1.25>`                    | версия kubernetes                                          |
| `containerNetworkType <string, optional, default = overlay_l2>` | тип сети в кластере                                        |
| `elasticIp <string, optional>`                                  | имя elasticIp для предоставления публичного доступа к API  |
| `clusterType <string, optional, default = VirtualMachine>`      | тип кластера                                               |
| `addons <KubernetesAddons, optional>`                           | описание дополнителных компонентов для установки в кластер |
| `labels <map(string,string), optional, default {}>`             | набор тэгов для кластера                                   |


#### KubernetesAddons - описание дополнительных компонентов
| Параметр                                               | Описание                                               |
|--------------------------------------------------------|--------------------------------------------------------|
| `ingress <KubernetesAddonsIngress, optional>`          | описание установки ingress-nginx-контроллера.          |
| `certManager <KubernetesAddonsCertManager, optional>`  | описание установки cert-manager.                       |
| `dashboard <KubernetesAddonsDashboard, optional>`      | описание установки kubernetes-дашборда                 |
| `manifests <KubernetesAdditionalManifest[], optional>` | описание установки дополнительных манифестов в кластер |

#### KubernetesAddonsIngress
| Параметр                                                                  | Описание                               |
|---------------------------------------------------------------------------|----------------------------------------|
| `enabled <boolean, required>`                                             | флаг для установки ingress             |
| `network <string, required>`                                              | имя VPC (для установки LB)             |
| `subnet <string, required>`                                               | имя подсети (для установки LB)         |
| `eipType <string, optional, default = 5_bgp>`                             | тип создаваемого ElasticIP для ingress |
| `chartVersion <string, optional, default = 4.6.0>`                        | версия helm-chart                      |
| `values <string, optional, default core/data/values/ingress-nginx.yaml>`  | путь до values-файла                   |
| `set <KubernetesHelmReleaseSet[], optional, default []>`                  | массив сетов для Helm-Chart            |

#### KubernetesAddonsCertManager
| Параметр                                                                        | Описание                                      |
|---------------------------------------------------------------------------------|-----------------------------------------------|
| `enabled <boolean, required>`                                                   | флаг для установки cert-manager               |
| `chartVersion <string, optional, default = v1.11.0>`                            | версия helm-chart                             |
| `values <string, optional, default core/data/values/cert-manager.yaml>`         | путь до values-файла                          |
| `set <KubernetesHelmReleaseSet[], optional, default  []>`                       | массив сетов для Helm-Chart                   |
| `issuerData <string, optional, default core/data/manifests/clusterissuer.yaml>` | путь до файла с манифестом для cluster-issuer |

#### KubernetesAddonsDashboard

| Параметр                                                             | Описание                                                 |
|----------------------------------------------------------------------|----------------------------------------------------------|
| `enabled <boolean, required>`                                        | флаг для установки dashboard                             |
| `chartVersion <string, optional, default 6.0.7>`                     | версия для Helm-Chart                                    |
| `values <string, optional, default core/data/values/dashboard.yaml>` | путь до файла с значением для Helm-Chart                 |
| `set <KubernetesHelmReleaseSet[], optional, default []>`             | массив сетов для Helm-Chart.                             |
| `createAdmin <boolean, optional, default false>`                     | создавать ли пользователя + токен для доступа к дашборду |


#### KubernetesHelmReleaseSet
| Параметр                   | Описание            |
|----------------------------|---------------------|
| `name <string, required>`  | имя переменной      |
| `value <string, required>` | значение переменной |


<a name="k8s_addons_manifests"></a>
#### KubernetesAdditionalManifest
| Параметр                  | Описание           |
|---------------------------|--------------------|
| `name <string, required>` | имя манифеста      |
| `path <string, required>` | путь до yaml-файла |

#### KubernetesNodeGroup
| Параметр                                                        | Описание                                          |
|-----------------------------------------------------------------|---------------------------------------------------|
| `name <string, required>`                                       | имя группы рабочих узлов                          |
| `authConfig <KubernetesNodeGroupAuthConfig, required>`          | конфигурация авторизации на рабочие узлы кластера |
| `flavorId <string, optional, default = s7n.large.2>`            | flavor-id для рабочих узлов кластера              |
| `scalePolicy <KubernetesNodeGroupScalePolicy, optional> `       | параметры масштабирования группы                  |
| `type <string, optional, default = vm>`                         | тип рабочих узлов кластера                        |
| `os <string, optional, default = CentOS 7.6>`                   | ОС рабочих узлов кластера                         |
| `priotity <number, optional, default = 1>`                      | приоритет группы в кластера                       |
| `runtime <string, optional, default = containerd>`              | runtime на группе узлов кластера                  |
| `nodeLabels <map(string,string), optional, default {}>`         | набор лейблов для нод кластера                    |
| `nodeTaints <KubernetesNodeGroupTaint[], optional, default []>` | набор теинтов для нод кластера                    |
| `rootVolume <KubernetesNodeGroupVolume, optional>`              | описание root-диска для нод кластера              |
| `dataVolumes <KubernetesNodeGroupVolume[], optional>`           | описание data-дисков для нод кластера             |
| `labels <map(string,string), optional, default {}>`             | набор тэгов для группы узлов кластера             |


#### KubernetesNodeGroupAuthConfig 

| Параметр                      | Описание                                             |
|-------------------------------|------------------------------------------------------|
| `method <string, required>`   | способ авторизации (password or keyPair)             |
| `keyPair <string, optional>`  | имя созданной пары ssh-ключей                        |
| `password <string, optional>` | пароль (будет создан автоматически если поле пустое) |

#### KubernetesNodeGroupScalePolicy
| Параметр                                                | Описание                                  |
|---------------------------------------------------------|-------------------------------------------|
| `autoScaleMode <boolean, optional, default false>`      | флаг для включения автомасштабирования    |
| `initialSize <number, optional, default 3>`             | стартовый (фиксированный) размер пула     |
| `autoScaleMin <number, optional, default 3>`            | минимальный размер группы                 |
| `autoScaleMax <number, optional, default 6>`            | максимальный размер группы                |
| `downCoolDownTimeMinutes <number, optional, default 1>` | время простоя при развертывании в минутах |

#### KubernetesNodeGroupTaint
| Параметр                    | Описание     |
|-----------------------------|--------------|
| `effect <string, required>` | taint-effect |
| `key <string, required> `   | taint-key    |
| `value <string, required>`  | taint-value  |

#### KubernetesNodeGroupVolume
| Параметр                                                   | Описание     |
|------------------------------------------------------------|--------------|
| `type <string, optional, default = SAS>`                   | тип диска    |
| `size <number, optional, default = 40 (root), 100 (data)>` | размер диска |

</details>


<a name="postgres"></a>
### Postgres Module

PostgresCluster - описание кластера Postgres

<details>
<summary> ⚙️ Описание структуры</summary>

| Параметр                                                      | Описание                                                                                 |
|---------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `name <string, required>`                                     | имя кластера                                                                             |
| `network <string, required>`                                  | имя VPC для размещения кластера                                                          |
| `subnet <string, required>`                                   | имя подсети для размещения кластера                                                      |
| `secGroup <string, required>`                                 | имя security-группы для применения к кластеру                                            |
| `availabilityZone <string, optional, default = ru-moscow-1a>` | availability-зона для размещения кластера                                                |
| `flavorId <string, optional, default = rds.pg.c6.large.2>`    | flavorId для кластера                                                                    |
| `version <string, optional, default = 12>`                    | версия Postgres                                                                          |
| `rootPassword <string, optional>`                             | root-пароль для кластера (если не указать - создастся автоматически)                     |
| `elasticIp <string, optional>`                                | ElasticIp для публичного доступа к кластеру (необходимо для создания БД и пользователей) |
| `volume <DBClusterVolume, optional>`                          | конфигурация диска                                                                       |
| `backupStrategy <DBClusterBackupStrategy, optional>`          | конфигурация бекапов                                                                     |
| `databases <PostgresDatabase[], optional>`                    | массив для создания БД и пользователей                                                   |
| `labels <map(string,string), optional, default {}>`           | набор тэгов для кластера                                                                 |


#### PostgresDatabase 
> Для кластера необходимо указать ElasticIP и добавить ваш IP-адрес в SecurityGroup

| Параметр                                        | Описание                       |
|-------------------------------------------------|--------------------------------|
| `dbName <string, required>`                     | имя базы данных                |
| `userName <string, required>`                   | имя пользователя               |
| `connLimit <number, optional, default = 10>`    | ограничение кол-ва подключений |
| `extensions <string[], optional, default = []>` | массив расширений для БД       |



#### DBClusterVolume
| Параметр                                  | Описание     |
|-------------------------------------------|--------------|
| `type <string, optional, default = HIGH>` | тип диска    |
| `size <number, optional, default = 100>`  | размер диска |


#### DBClusterBackupStrategy
| Параметр                                              | Описание                      |
|-------------------------------------------------------|-------------------------------|
| `startTime <string, optional, default = 00:00-01:00>` | время снятия бекапа           |
| `keepDays <number, optional, default = 7>`            | время хранения бекапов в днях |

</details>

