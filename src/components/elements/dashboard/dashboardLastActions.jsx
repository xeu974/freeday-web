import React from 'react';

import Language from '../../../utils/language';




const DashboardActivityFeed = (props) => {
    const {
        activity
    } = props;
    const message = Language.text(('dashboard.activity.modification'),2);
    const user = activity.slackUser.name;
    return (
        <div class="card">
            <div class="card-title">{Language.text('dashboard.activity.title')}</div>
            <div class="card-content last-activities">{user} {message}</div>
        </div>
    );
};

export default DashboardActivityFeed;
