using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace ToDoAPI.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum EToDoStatus
    {
        TODO,
        DOING,
        DONE
    }
}
