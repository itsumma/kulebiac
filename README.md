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
cdktf out <stack_name> --outputs-file <path_to_output_file>  --outputs-file-include-sensitive-outputs true
```

## Возможности Kulebiac

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

## Version History

- 1.1.0 (все корневые массивы для ресурсов в стэке с обязательных переключены на опциональные)
- 1.0.0

## License

Apache License 2.0, see [LICENSE](https://github.com/itsumma/kulebiac/blob/master/LICENSE).

## Acknowledgments

Ссылки:

Группа [Telegram](https://t.me/kulebiac)

*Разрабатывается и поддерживается [itsumma.ru](https://www.itsumma.ru)* 
