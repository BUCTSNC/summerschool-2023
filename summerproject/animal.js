class animal{
    constructor(name,age,gender)
    {
        this._name=name;
        this._age=age;
        this._gender=gender;
    }
    get name()
    {
        return this._name;
    }
    get age()
    {
        return this._age;
    }
    set age(value)
    {
        if(Number.isInteger(value) && value >= 1)
        {
            this._age=age
        }
        else 
        console.log("err");
    }
    get gender()
    {
        return this._gender;
    }
    set gender(value)
    {
        if(value=='f' || value=='m') this._gender=gender;
        else console.log("err");
    }
    
}
const an = new animal("Harry", 2,"m");
console.log(an);