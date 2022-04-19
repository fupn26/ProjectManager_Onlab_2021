using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;
using ToDoAPI.Models;

namespace ToDoAPI.Cache
{
    public class ToDoCache : IToDoCache
    {
        private readonly IDistributedCache _cache;
        private readonly DistributedCacheEntryOptions _cacheEntryOptions;

        public ToDoCache(IDistributedCache cache)
        {
            _cache = cache;
            // The cached todos are stored for 1 minute
            _cacheEntryOptions = new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(1));
        }

        public async Task<ToDo> GetCachedToDo(string toDoId)
        {
            var cachedItem = await _cache.GetStringAsync(MapToCacheKey(toDoId));
            if (cachedItem == null)
                return null;
            else
                return JsonConvert.DeserializeObject<ToDo>(cachedItem);
        }

        public async Task Add(ToDo toDoToAdd)
        {
            var toDoString = JsonConvert.SerializeObject(toDoToAdd);
            await _cache.SetStringAsync(key: MapToCacheKey(toDoToAdd.Id.ToString()), value: toDoString, options: _cacheEntryOptions);
        }

        public Task Invalidate(string toDoId) => _cache.RemoveAsync(MapToCacheKey(toDoId));

        private string MapToCacheKey(string toDoId) => $"todo-{toDoId}";
    }
}
