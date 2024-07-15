
import DayJS from 'dayjs';
import React, { Component } from 'react';

import Loading from '../elements/Loading';

import DashboardUtils from '../../utils/dashboard';



import '../../css/elements/dashboard.css';
import '../../css/elements/filter.css';
import '../../css/pages/dayoff.css';
import Language from '../../utils/language';
import DashboardActionToTake from '../elements/dashboard/dashboardActionToTake';
import DashboardActivityFeed from '../elements/dashboard/dashboardLastActions';
import DashboardMetrics from '../elements/dashboard/dashboardMetrics';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        const filter = {
            start: DayJS().format('YYYY-MM-DD'),
            end: DayJS().format('YYYY-MM-DD'),
            status: 'confirmed'
        };
        const filterActions = {
            start: DayJS().format('YYYY-MM-DD'),
            status: 'pending'
        }

        this.state = {
            loading: true,
            filter,
            filterActions,
            numberDaysoff: 0,
            numberSlackUsers: 0,
            numberActions: 0,
            activity: null,
            formDialog: false,
            dayoffId: null
        };
    }

    async componentDidMount() {
    // chargement données page
        await DashboardUtils.init(this);
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    handleInit = (data) => {
        this.setState({
            loading: false,
            ...data
        });
    };

    updateState = (newState) => {
        this.setState(newState);
    };

    // refresh les données de la page
    refresh = async () => {
        const { filter } = this.state;
        const daysoffById = await DashboardUtils.getDaysoff(filter);
        this.setState({
            daysoff: daysoffById
        });
    };

    // renvoie données absences traitées pour récapitulatif
    getData() {
        const {
            filter,
            dayoffTypes,
            slackUsers
        } = this.state;
        let data = {};
        const startDate = DayJS(filter.start).toDate();
        const endDate = DayJS(filter.end).toDate();
        // liste jours du mois
        const dayList = DayoffDate.getDayList(startDate, endDate, 'YYYY-MM-DD');
        // compte de jours travaillés dans le mois
        const workDaysCount = DayoffDate.getWorkDays(
            filter.start,
            filter.end,
            dayList
        );
        // insère users dans données parsées
        const typeCount = {};
        for (const dt of dayoffTypes) {
            typeCount[dt.id] = 0;
        }
        slackUsers.forEach((user) => {
            data[user.slackId] = {
                slackId: user.slackId,
                name: user.name,
                avatar: user.avatar,
                workingCount: workDaysCount,
                dayoffCount: 0,
                typeCount: { ...typeCount }
            };
        });
        // insère données absences
        data = this.processDataDaysoff(data, dayList);
        // filtre users
        if (!filter.all) {
            Object.keys(data).forEach((userId) => {
                if (data[userId].dayoffCount === 0) {
                    delete data[userId];
                }
            });
        }
        //
        return data;
    }


    // rendu page
    render() {
        const {
            loading,
            daysoff,
            numberDaysoff,
            numberSlackUsers,
            numberActions,
            activity,
        } = this.state;

        const {
            language
        } = this.props;
        if (loading) {
        // rendu chargement page
            return (
                <div id="content">
                    <Loading />
                </div>
            );
        }
        return (
            <div class="dashboard-container">
                <div class="header">
                    <div class="dashboard-title">{`${Language.text('nav.dashboard')} ~ ${DayJS().format('YYYY-MM-DD')}`}</div>
                </div>
                
                <div class="elements-container">
                    
                    <DashboardMetrics
                                numberPresent={numberSlackUsers-numberDaysoff}
                                numberDaysoff={numberDaysoff}
                    />

                    <DashboardActionToTake action={numberActions}/>

                    <DashboardActivityFeed activity={activity}/>
                </div>
            </div>

        );
    }
}

export default Dashboard;
