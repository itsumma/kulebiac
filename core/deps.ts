export function generateDepsArr(data: any){
    const res = [];
    for(const k in data){
        res.push(data[k]);
    }
    return res;
}