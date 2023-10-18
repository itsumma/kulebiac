import {Construct} from "constructs";
import {
    KubernetesAddons,
    KubernetesAdditionalManifest,
    KubernetesHelmReleaseExtended,
    KubernetesHelmReleaseSet,
    KubernetesAdditionalRawManifest,
    KubernetesLockboxClusterSecretStore
} from "../../core/interfaces/yc/k8sAddons";
import {StoreAccountKeys, StoreBuckets, StoreStaticAccessKeys, StoreStaticIps} from "../../core/interfaces/yc/store";
import {readfile} from "../../core/readfile";
import {HelmProvider} from "@cdktf/provider-helm/lib/provider";
import {Release} from "@cdktf/provider-helm/lib/release";
import {KubernetesProvider} from "@cdktf/provider-kubernetes/lib/provider";
import {KubectlProvider} from "../../.gen/providers/kubectl/provider";
import {Manifest} from "../../.gen/providers/kubectl/manifest";
import {Password} from "../../.gen/providers/random/password";
import {Secret} from "@cdktf/provider-kubernetes/lib/secret";
import {Fn, ITerraformDependable, TerraformOutput, Token} from "cdktf";
import * as path from "path";

export class K8sAddons extends Construct{
    private readonly staticIps : StoreStaticIps | any = {}
    private readonly staticAccessKeys: StoreStaticAccessKeys = {};
    private readonly accountKeys: StoreAccountKeys = {};
    private readonly buckets: StoreBuckets = {};

    constructor(
        scope: Construct,
        name: string,
        clusterId: string,
        helmProvider: HelmProvider,
        k8sProvider: KubernetesProvider,
        kubectlProvider: KubectlProvider,
        dependencies: ITerraformDependable[] = [],
        addons: KubernetesAddons,
        staticIps: StoreStaticIps = {},
        staticAccessKeys: StoreStaticAccessKeys = {},
        accountKeys: StoreAccountKeys = {},
        buckets: StoreBuckets = {}
    ) {
        super(scope, name);

        this.staticIps = staticIps;
        this.staticAccessKeys = staticAccessKeys;
        this.accountKeys = accountKeys;
        this.buckets = buckets;

        const __defaultParams = {
            ingress: {
                values: "core/data/values/ingress-nginx.yaml",
                defaultVersion: "4.6.0"
            },
            certManager: {
                values: "core/data/values/cert-manager.yaml",
                clusterIssuer: "core/data/manifests/clusterissuer.yaml",
                defaultVersion: "v1.11.0"
            },
            dashboard: {
                values: "core/data/values/dashboard.yaml",
                admin: "core/data/manifests/dashboard-admin.yaml",
                defaultVersion: "6.0.7"
            },
            lockbox: {
                values: "core/data/values/lockbox.yaml",
                defaultVersion: "0.9.1"
            },
            gitlabRunners: {
                values: "core/data/values/gitlab-runners.yaml",
                defaultVersion: "0.57.1"
            }
        }

        let ejs = require('ejs');

        if(
            addons.s3Storage
            &&
            addons.s3Storage.enabled
            &&
            addons.s3Storage.bucket
            &&
            addons.s3Storage.serviceAccount
        ){
            const storageData = {
                bucket: this.buckets[addons.s3Storage.bucket].bucket,
                accessKey: this.staticAccessKeys[`${addons.s3Storage.serviceAccount}__access_key`].accessKey,
                secretKey: this.staticAccessKeys[`${addons.s3Storage.serviceAccount}__access_key`].secretKey
            }

            ejs.renderFile('core/data/manifests/yc-s3-storage.yaml', {tpl: storageData}, {}, (err: any, str: string) => {

                const manifests = str.split('---');
                manifests.forEach((item: string, key: number) => {
                    const _mKey = `${clusterId}__storage__${key}`;
                    new Manifest(scope, _mKey, {
                        dependsOn: dependencies,
                        provider: kubectlProvider,
                        yamlBody: item,
                        serverSideApply: true
                    });
                });
            });
        }

        if(addons.manifests){
            addons.manifests.forEach((item: KubernetesAdditionalManifest) => {
                ejs.renderFile(item.path, {}, {}, (err: any, str: string)=> {
                    const manifests: string[] = str.split('---');
                    manifests.forEach((_strItem: string, key: number) => {
                        if(_strItem === '')
                            return;

                        const _mKey = `${clusterId}__manifest__${item.name}__${key}`;
                        new Manifest(scope, _mKey, {
                            dependsOn: dependencies,
                            provider: kubectlProvider,
                            yamlBody: _strItem,
                            serverSideApply: true
                        });
                    })
                })
            })
        }


        const __releases : KubernetesHelmReleaseExtended[] = [];
        if(addons.ingress && addons.ingress.enabled){
            const ingressData = addons.ingress;
            let _sets : KubernetesHelmReleaseSet[] = [];
            if(ingressData.staticIp){
                _sets.push({
                    name: 'controller.service.loadBalancerIP',
                    value: this.staticIps[ingressData.staticIp].externalIpv4Address.address
                });
            }
            if(ingressData.set){
                _sets = [..._sets, ...ingressData.set];
            }
            __releases.push({
                release: {
                    name: "ingress-nginx",
                    namespace: "ingress-nginx",
                    repository: "https://kubernetes.github.io/ingress-nginx",
                    chart: "ingress-nginx",
                    version: ingressData.chartVersion ? ingressData.chartVersion : __defaultParams.ingress.defaultVersion,
                    createNamespace: true,
                    set: _sets,
                    rawValues: [ingressData.values ? readfile(ingressData.values) : readfile(__defaultParams.ingress.values)],
                    wait: true,
                    disableOpenapiValidation: true
                }
            });
        }

        if(addons.certManager && addons.certManager.enabled){
            const certManagerData = addons.certManager;

            __releases.push({
                release: {
                    name: "cert-manager",
                    namespace: "cert-manager",
                    repository: "https://charts.jetstack.io",
                    chart: "cert-manager",
                    version: certManagerData.chartVersion ? certManagerData.chartVersion : __defaultParams.certManager.defaultVersion,
                    createNamespace: true,
                    set: certManagerData.set ? certManagerData.set : [],
                    rawValues: [certManagerData.values ? readfile(certManagerData.values) : readfile(__defaultParams.certManager.values)],
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: addons.certManager.issuerData ?  [{
                    name: "cluster-issuer",
                    path: addons.certManager.issuerData
                }] : [{
                    name: "cluster-issuer",
                    path: __defaultParams.certManager.clusterIssuer
                }]
            })
        }

        if(addons.dashboard && addons.dashboard.enabled){
            const dashboardData = addons.dashboard;

            __releases.push({
                release: {
                    name: "kubernetes-dashboard",
                    namespace: "kubernetes-dashboard",
                    repository: "https://kubernetes.github.io/dashboard/",
                    chart: "kubernetes-dashboard",
                    version: dashboardData.chartVersion ? dashboardData.chartVersion : __defaultParams.dashboard.defaultVersion,
                    createNamespace: true,
                    set: dashboardData.set ? dashboardData.set : [],
                    rawValues: [dashboardData.values ? readfile(dashboardData.values) : readfile(__defaultParams.dashboard.values)],
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: addons.dashboard.createAdmin ? [{
                    name: "dashboard-admin",
                    path: __defaultParams.dashboard.admin
                }] : []
            })
        }


        if(addons.lockboxOperator && addons.lockboxOperator.enabled && addons.lockboxOperator.secretStores){
            const _rawManifests: KubernetesAdditionalRawManifest[] = [];
            addons.lockboxOperator.secretStores.forEach((secretStore: KubernetesLockboxClusterSecretStore) => {
                const _accountKey = this.accountKeys[`${secretStore.sa}__account_key`]
                const authorizedKey = {
                    created_at: Token.asString(_accountKey.createdAt),
                    id: Token.asString(_accountKey.id),
                    key_algorithm: Token.asString(_accountKey.keyAlgorithm),
                    private_key: Token.asString(_accountKey.privateKey),
                    public_key: Token.asString(_accountKey.publicKey),
                    service_account_id: Token.asString(_accountKey.serviceAccountId)
                };


                const authorizedKeyStr = Fn.base64encode(Fn.jsonencode(authorizedKey));
                const __secretTplData = {
                    name: `${secretStore.name}--secret`,
                    ns: 'external-secrets',
                    key: authorizedKeyStr
                };

                ejs.renderFile('core/data/manifests/yc-auth.yaml', {tpl: __secretTplData}, {}, (err: any, str: string) => {
                    _rawManifests.push({
                        name: `${secretStore.name}--secret-manifest`,
                        data: str
                    });
                });

                const __secretStoreTplData = {
                    name: secretStore.name,
                    ns: 'external-secrets',
                    secretName:`${secretStore.name}--secret`
                };

                ejs.renderFile('core/data/manifests/cluster-secret-store.yaml', {tpl: __secretStoreTplData}, {}, (err: any, str: string) => {
                    _rawManifests.push({
                        name: `${secretStore.name}`,
                        data: str
                    });
                });

            })
            const lockBoxData = addons.lockboxOperator;

            __releases.push({
                release: {
                    name: "external-secrets",
                    namespace: "external-secrets",
                    repository: "https://charts.external-secrets.io",
                    chart: "external-secrets",
                    version: lockBoxData.chartVersion ? lockBoxData.chartVersion : __defaultParams.lockbox.defaultVersion,
                    createNamespace: true,
                    set: lockBoxData.set ? lockBoxData.set : [],
                    rawValues: [lockBoxData.values ? readfile(lockBoxData.values) : readfile(__defaultParams.lockbox.values)],
                    wait: true,
                    disableOpenapiValidation: true
                },
                rawManifests: _rawManifests
            })
        }

        if(addons.gitlabRunners && addons.gitlabRunners.enabled){
            const gitlabData = addons.gitlabRunners;

            const _sets: KubernetesHelmReleaseSet[] = [];
            _sets.push({
                name: "gitlabUrl",
                value: gitlabData.gitlabUrl
            });
            _sets.push({
                name: "runnerRegistrationToken",
                value: gitlabData.token
            });
            if(gitlabData.tags){
                _sets.push({
                    name: "runners.tags",
                    value: gitlabData.tags
                })
            }

            __releases.push({
                release: {
                    name: "gitlab-runners",
                    namespace: "gitlab-runners",
                    repository: "https://charts.gitlab.io/",
                    chart: "gitlab-runner",
                    version: gitlabData.chartVersion ? gitlabData.chartVersion : __defaultParams.gitlabRunners.defaultVersion,
                    createNamespace: true,
                    set: _sets,
                    rawValues: [gitlabData.values ? readfile(gitlabData.values) : readfile(__defaultParams.gitlabRunners.values)],
                    wait: true,
                    disableOpenapiValidation: true
                }
            })
        }


       __releases.forEach((release: KubernetesHelmReleaseExtended) => {
            const releaseData = release.release;
            const _release = new Release(scope, `${clusterId}__${releaseData.name}`, {
                dependsOn: dependencies,
                provider: helmProvider,
                name: releaseData.name,
                namespace: releaseData.namespace,
                repository: releaseData.repository,
                chart: releaseData.isLocal && releaseData.isLocal ? path.resolve(releaseData.chart) : releaseData.chart,
                version: releaseData.version,
                createNamespace: releaseData.createNamespace,
                set: releaseData.set,
                values: releaseData.values ? (typeof releaseData.values === "string" ? [readfile(releaseData.values)] : releaseData.values.map((path: string) => readfile(path))) : releaseData.rawValues,
                wait: releaseData.wait,
                disableOpenapiValidation: releaseData.disableOpenapiValidation
            });

            if(release.additionalManifests && release.additionalManifests.length > 0){
                release.additionalManifests.forEach((manifest: KubernetesAdditionalManifest ) => {
                    ejs.renderFile(manifest.path, {}, {}, (err: any, str: string) => {
                        const manifests: string[] = str.split('---');
                        manifests.forEach((item: string, key: number) => {
                            if(item === '')
                                return ;

                            const _mKey = `${clusterId}__${releaseData.name}__${manifest.name}__${key}`;
                            new Manifest(scope, _mKey, {
                                provider: kubectlProvider,
                                yamlBody: item,
                                serverSideApply: true,
                                dependsOn: [_release]
                            })
                        });
                    });
                })
            }

           if(release.rawManifests && release.rawManifests.length > 0){
               release.rawManifests.forEach((manifest: KubernetesAdditionalRawManifest) => {
                   new Manifest(scope, manifest.name, {
                       provider: kubectlProvider,
                       yamlBody: manifest.data,
                       serverSideApply: true,
                       dependsOn: [_release]
                   });
               })
           }
        });
    }
}