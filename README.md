# KulebiaC

![logo](https://www.itsumma.ru/assets/images/kulebiac-logo.jpg)

[![Telegram Url](https://img.shields.io/badge/Telegram-chat-blue?logo=telegram)](https://t.me/kulebiac)
[![HitCount](https://hits.dwyl.com/itsumma/kulebiac.svg?style=flat-square)](http://hits.dwyl.com/itsumma/kulebiac)


Развертывание необходимой облачной инфраструктуры из одного простого yaml-файла.
Данный инструмент разрабатывается и поддерживается компанией ITSumma, мы с радостью ответим на ваши вопросы в [телеграм чате …](https://t.me/kulebiac)

## Поддерживаемые провайдеры:

* YandexCloud

## Как воспользоваться?

* Install [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
* Install [cdktf](https://developer.hashicorp.com/terraform/tutorials/cdktf/cdktf-install)
 
## Установка зависимостей
 ```
  yarn install
  cdktf get
  ```

### Для YandexCloud

* Создать каталог (1 каталог == 1 окружение)
* Получить API-token для взаимодействия с [YandexCloud](https://cloud.yandex.com/en/docs/tutorials/infrastructure-management/terraform-quickstart#get-credentials)
* В каталоге создать s3-бакет для хранения state
* В каталоге создать сервис-аккаунт, назначить ему роль admin и создать статический ключ доступа (для взаимодействия с S3-Storage)

> Опционально (для установки различных компонентов в k8s-кластера)

* Install [Helm](https://helm.sh/docs/intro/install/)

```
helm repo add jetstack https://charts.jetstack.io
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
helm repo update
```

### Подготовка конфигурации
* cp .env.example .env
* заполнить .env | export ENV_NAME_1=<val_1> ENV_NAME_2=<val_2>...
* подготовить файл конфигурации config.yaml - [Структура](https://github.com/itsumma/kulebiac/blob/master/USAGE.md)

### Запуск плана/деплоя
```
cdktf diff <stack_name>
cdktf deploy <stack_name>
cdktf output <stack_name> --outputs-file <path_to_output_file>  --outputs-file-include-sensitive-outputs true
```

### Запуск из настроенного окружения в docker
```bash
docker run --rm --name kulebiac -v ${PWD}/config.yaml:/app/config.yaml --env-file ${PWD}/.env -ti ghcr.io/itsumma/kulebiac/kulebiac:v1.6.0 bash
# далее внутри докера выполняем
cdktf diff production
cdktf deploy production
```

### Запуск из gitlab ci
Для запуса нужен предварительно настроенный раннер, который может запускать докер образы

В код репозитория кладём config.yaml

в Settings гитлаба в секцию CI/CD прописываем нужные нам Variables:  KULEBIAC_YC_TOKEN, KULEBIAC_CLOUD_ID, KULEBIAC_FOLDER_ID, KULEBIAC_STATE_BUCKET_NAME, KULEBIAC_ACCESS_KEY, KULEBIAC_SECRET_KEY, KULEBIAC_STACK

Прописываем в .gitlab-ci.yml примерно следующее
```bash
stages:
  - deploy

deploy:
  stage: deploy
  image: ghcr.io/itsumma/kulebiac/kulebiac:v1.6.0
  variables:
    YC_TOKEN: ${KULEBIAC_YC_TOKEN}
    CLOUD_ID: ${KULEBIAC_CLOUD_ID}
    FOLDER_ID: ${KULEBIAC_FOLDER_ID}
    STATE_BUCKET_NAME: ${KULEBIAC_STATE_BUCKET_NAME}
    ACCESS_KEY: ${KULEBIAC_ACCESS_KEY}
    SECRET_KEY: ${KULEBIAC_SECRET_KEY}
  script:
    - cp config.yaml /app && cd /app
    - cdktf diff ${KULEBIAC_STACK} || true #если раннер в России, первая команда упадёт с ошибкой изза блокировок со стороны hashicorp. Нужно просто повторить её
    - cdktf diff ${KULEBIAC_STACK}
    - cdktf deploy ${KULEBIAC_STACK} --auto-approve
  tags:
    - docker
```
(tags прописываем соответственно настроенному раннеру)

## Возможности KulebiaС

Описание облачной инфраструктуры в виде terraform сценариев может занимать очень много времени, модули, как правило, получаются довольно специфичными и тяжелыми в реиспользовании и не обеспечивают необходимого PaaS подхода к описанию инфраструктуры – каждый контур, как правило, описывается отдельно и имеет свой порядок и план выполнения.
Мы разработали данный инструмент для возможности предоставления именно платформенного подхода к использованию облачных ресурсов в рамках методологий IaC и DevOps:

1. Инфраструктура описана в доступном формате (yaml)
2. Возможность довольно легко и быстро разворачивать новые окружения без дополнительного изменения декларативного описания инфраструктуры
3. Вся инфраструктура разворачивается за один проход инструмента

## Принцип работы

Kulebiac реализован на базе инструмента [Cdktf](https://developer.hashicorp.com/terraform/cdktf), в который мы портировали наши Terraform-модули (в частности - для YandexCloud) в TypeScript-формат (не через генерацию биндингов), что позволило нам:

* гораздо гибче работать с вложенными итерациями по массивам
* динамически кодом создавать дополнительные вспомогательные провайдеры - например, после создания двух кластеров k8s, через вспомогательные провайдеры можно установить в эти кластеры различные компоненты (ingress-контроллер, cert-manager)
* использовать строгую типизацию для входных параметров модуля с возможностью использования опциональных переменных с дефолтными значениями (исходно в hcl так нельзя)

В итоге работы инструмента вы получаете сгенерированный в json формате файл конфигурации terraform, который применит все в конкретном каталоге.
Также, основываясь на сущности STACK предоставляемой cdktf, с помощью единого конфигурационного файла можно описать несколько изолированных друг от друга окружений (в данный момент - на основе YandexCloud - окружения можно сетапить в разные Folder/Cloud - в дальнейшем, использовать абсолютно различные провайдеры) - аналогичный пример  - https://terragrunt.gruntwork.io/

## Примеры использования

* Нужна скорая инфраструктура для стартапа – Kubernetes + стандартные аддоны + Postgres - [пример №1](https://github.com/itsumma/kulebiac/blob/master/examples/example_1/config.yaml)
  - результат – VPC, Nat-Instance, Kubernetes (+ autoscaling) + Postgres, S3-PVC
* Нужно dev и prod окружение, Kubernetes, Postgres, RabbitMQ, Gitlab - [пример №2](https://github.com/itsumma/kulebiac/blob/master/examples/example_2/config.yaml)
  - результат – раздельные контуры на уровне сети, безопасность, instance с cloud-init, S3-PVC, прерываемые ASG на dev Kubernetes
* Необходимо создать S3-бакеты для хостинга статичных сайтов и хранения загружаемого контента, интегрировать  K8S с Lockbox для синхронизации секретов ([на основе](https://external-secrets.io/v0.5.7/guides-all-keys-one-secret/)) - [пример №3](https://github.com/itsumma/kulebiac/blob/master/examples/example_3/config.yaml)
  - результат - VPC, Nat-Instance, Kuberenetes с синхронизацией Lockbox [пример секрета для приложения](https://github.com/itsumma/kulebiac/blob/master/examples/example_3/external-secret.yaml), секреты в Lockbox можно задавать как в открытом виде, так и через переменные окружения

## Version History

- 1.6.0 (KMS, LockBox, S3-CORS, S3-Website-hosting, Docker + CI/CD examples)
- 1.5.0 (MySQL, MongoDB, Redis, ClickHouse, минорные оптимизации и рефакторинг)
- 1.4.0 (рефакторинг PG-модуля, доступы к PG для DataLens, DataTransfer...)
- 1.3.0 (дополнительные статические маршруты, зависимость между SA и K8S)
- 1.2.0 (оутпуты для модуля Instances)
- 1.1.0 (все корневые массивы для ресурсов в стэке с обязательных переключены на опциональные)
- 1.0.0

## License

Apache License 2.0, see [LICENSE](https://github.com/itsumma/kulebiac/blob/master/LICENSE).

## Acknowledgments

Ссылки:

Группа [Telegram](https://t.me/kulebiac)

*Разрабатывается и поддерживается [itsumma.ru](https://www.itsumma.ru)* 
