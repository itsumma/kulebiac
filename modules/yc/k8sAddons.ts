import {Construct} from "constructs";
import {
    KubernetesAddons,
    KubernetesHelmAdditionalManifest,
    KubernetesHelmReleaseExtended, KubernetesHelmReleaseSet
} from "../../core/interfaces/yc/k8sAddons";
import {StoreBuckets, StoreStaticAccessKeys, StoreStaticIps} from "../../core/interfaces/yc/store";
import {readfile} from "../../core/readfile";
import {HelmProvider} from "@cdktf/provider-helm/lib/provider";
import {Release} from "@cdktf/provider-helm/lib/release";
import {KubernetesProvider} from "@cdktf/provider-kubernetes/lib/provider";
import {KubectlProvider} from "../../.gen/providers/kubectl/provider";
import {Manifest} from "../../.gen/providers/kubectl/manifest";
import {Password} from "../../.gen/providers/random/password";
import {Secret} from "@cdktf/provider-kubernetes/lib/secret";
import {Fn, TerraformOutput} from "cdktf";

export class K8sAddons extends Construct{
    private readonly staticIps : StoreStaticIps | any = {}
    private readonly staticAccessKeys: StoreStaticAccessKeys = {};
    private readonly buckets: StoreBuckets = {};

    constructor(
        scope: Construct,
        name: string,
        clusterId: string,
        helmProvider: HelmProvider,
        k8sProvider: KubernetesProvider,
        kubectlProvider: KubectlProvider,
        addons: KubernetesAddons,
        staticIps: StoreStaticIps = {},
        staticAccessKeys: StoreStaticAccessKeys = {},
        buckets: StoreBuckets = {}
    ) {
        super(scope, name);

        this.staticIps = staticIps;
        this.staticAccessKeys = staticAccessKeys;
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
            }
        }

        if(
            addons.s3Storage.enabled
            &&
            addons.s3Storage.bucket !== undefined
            &&
            addons.s3Storage.serviceAccount !== undefined
        ){
            const storageData = {
                bucket: this.buckets[addons.s3Storage.bucket].bucket,
                accessKey: this.staticAccessKeys[`${addons.s3Storage.serviceAccount}__access_key`].accessKey,
                secretKey: this.staticAccessKeys[`${addons.s3Storage.serviceAccount}__access_key`].secretKey
            }
            let ejs = require('ejs');

            ejs.renderFile('core/data/manifests/yc-s3-storage.yaml', {tpl: storageData}, {}, (err: any, str: string) => {

                const manifests = str.split('---');
                manifests.forEach((item: string, key: number) => {
                    const _mKey = `${clusterId}__storage__${key}`;
                    new Manifest(scope, _mKey, {
                        provider: kubectlProvider,
                        yamlBody: item,
                        serverSideApply: true
                    });
                });
            });
        }

        const __releases : KubernetesHelmReleaseExtended[] = [];
        if(addons.ingress.enabled){
            let _sets : KubernetesHelmReleaseSet[] = [];
            if(addons.ingress.staticIp !== undefined){
                _sets.push({
                    name: 'controller.service.loadBalancerIP',
                    value: this.staticIps[addons.ingress.staticIp].externalIpv4Address.address
                });
            }
            if(addons.ingress.set !== undefined){
                _sets = [..._sets, ...addons.ingress.set];
            }
            __releases.push({
                release: {
                    name: "ingress-nginx",
                    namespace: "ingress-nginx",
                    repository: "https://kubernetes.github.io/ingress-nginx",
                    chart: "ingress-nginx",
                    version: addons.ingress.chartVersion !== undefined ? addons.ingress.chartVersion : __defaultParams.ingress.defaultVersion,
                    createNamespace: true,
                    set: _sets,
                    values: addons.ingress.values !== undefined ?  addons.ingress.values : __defaultParams.ingress.values,
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: []
            });
        }

        if(addons.certManager.enabled){
            __releases.push({
                release: {
                    name: "cert-manager",
                    namespace: "cert-manager",
                    repository: "https://charts.jetstack.io",
                    chart: "cert-manager",
                    version: addons.certManager.chartVersion !== undefined ? addons.certManager.chartVersion : __defaultParams.certManager.defaultVersion,
                    createNamespace: true,
                    set: addons.certManager.set !== undefined ? addons.certManager.set : [],
                    values: addons.certManager.values !== undefined ? addons.certManager.values : __defaultParams.certManager.values,
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: addons.certManager.issuerData !== undefined ?  [{
                    name: "cluster-issuer",
                    path: addons.certManager.issuerData
                }] : [{
                    name: "cluster-issuer",
                    path: __defaultParams.certManager.clusterIssuer
                }]
            })
        }

        if(addons.dashboard.enabled){
            __releases.push({
                release: {
                    name: "kubernetes-dashboard",
                    namespace: "kubernetes-dashboard",
                    repository: "https://kubernetes.github.io/dashboard/",
                    chart: "kubernetes-dashboard",
                    version: addons.dashboard.chartVersion !== undefined ? addons.dashboard.chartVersion : __defaultParams.dashboard.defaultVersion,
                    createNamespace: true,
                    set: addons.dashboard.set !== undefined ? addons.dashboard.set : [],
                    values: addons.dashboard.values !== undefined ? addons.dashboard.values : __defaultParams.dashboard.values,
                    wait: true,
                    disableOpenapiValidation: true
                },
                additionalManifests: addons.dashboard.createAdmin ? [{
                    name: "dashboard-admin",
                    path: __defaultParams.dashboard.admin
                }] : []
            })
        }


       __releases.forEach((release: KubernetesHelmReleaseExtended) => {
            const releaseData = release.release;
            const _release = new Release(scope, `${clusterId}__${releaseData.name}`, {
                provider: helmProvider,
                name: releaseData.name,
                namespace: releaseData.namespace,
                repository: releaseData.repository,
                chart: releaseData.chart,
                version: releaseData.version,
                createNamespace: releaseData.createNamespace,
                set: releaseData.set,
                values: [readfile(releaseData.values)],
                wait: releaseData.wait,
                disableOpenapiValidation: releaseData.disableOpenapiValidation
            });

            if(release.additionalManifests !== undefined && release.additionalManifests.length > 0){
                release.additionalManifests.forEach((manifest: KubernetesHelmAdditionalManifest ) => {
                    new Manifest(scope, `${clusterId}__${releaseData.name}__${manifest.name}`, {
                        provider: kubectlProvider,
                        yamlBody: readfile(manifest.path),
                        dependsOn: [_release]
                    });
                })
            }
        });
    }
}