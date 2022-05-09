using MeetingAPI.Models;
using MongoDAL.Context;
using MongoDAL.Repositories;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MeetingAPI.Repositories
{
    public class MeetingRepository : BaseRepository<Meeting>, IMeetingRepository
    {
        private readonly string _indexName = "Theme_Project_Unique";

        public MeetingRepository(IDbContext context) : base(context)
        {
            var indexKeyDefinitions = Builders<Meeting>.IndexKeys.Ascending("Theme").Ascending("ProjectId");
            var createIndexOptions = new CreateIndexOptions()
            {
                Name = _indexName,
                Unique = true
            };
            _collection.Indexes.CreateOne(new CreateIndexModel<Meeting>(indexKeyDefinitions, createIndexOptions));
        }

        public async Task<UpdateResult> UpdateDate(string id, DateTime newStartTime, DateTime newEndTime)
        {
            var filter = Builders<Meeting>.Filter.Eq(meeting => meeting.Id, id);
            var updateDef = Builders<Meeting>.Update.Set(meeting => meeting.StartTime, newStartTime)
                .Set(meeting => meeting.EndTime, newEndTime);

            return await _collection.UpdateOneAsync(filter, updateDef);
        }

        public async Task<UpdateResult> UpdateNotes(string id, string newNotes)
        {
            var filter = Builders<Meeting>.Filter.Eq(meeting => meeting.Id, id);
            var updateDef = Builders<Meeting>.Update.Set(meeting => meeting.Notes, newNotes);

            return await _collection.UpdateOneAsync(filter, updateDef);
        }

        public async Task<UpdateResult> UpdateParticipants(string id, List<string> newParticipants)
        {
            var filter = Builders<Meeting>.Filter.Eq(meeting => meeting.Id, id);
            var updateDef = Builders<Meeting>.Update.Set(meeting => meeting.Participants, newParticipants);

            return await _collection.UpdateOneAsync(filter, updateDef);
        }

        public async Task<UpdateResult> UpdatePlace(string id, string newPlace)
        {
            var filter = Builders<Meeting>.Filter.Eq(meeting => meeting.Id, id);
            var updateDef = Builders<Meeting>.Update.Set(meeting => meeting.Place, newPlace);

            return await _collection.UpdateOneAsync(filter, updateDef);
        }

        public async Task<UpdateResult> UpdateTheme(string id, string newTheme)
        {
            var filter = Builders<Meeting>.Filter.Eq(meeting => meeting.Id, id);
            var updateDef = Builders<Meeting>.Update.Set(meeting => meeting.Theme, newTheme);

            return await _collection.UpdateOneAsync(filter, updateDef);
        }
    }
}
